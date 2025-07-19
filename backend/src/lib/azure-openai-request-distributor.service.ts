import logger from "@/lib/logger.service";
import { Endpoint } from "@/types/azure";
import { Cache } from "./cache.service";

class AzureOpenAIRequestDistributor {
  private cache: Cache<{
    tokensRemaining: number;
    requestsRemaining: number;
  }>;
  private endpoints: Endpoint[];

  constructor(
    cache: Cache<{
      tokensRemaining: number;
      requestsRemaining: number;
    }>,
    endpoints: Endpoint[]
  ) {
    this.cache = cache;
    this.endpoints = endpoints;
    this.initializeUsage(endpoints).catch((err) => {
      logger.error("Failed to initialize endpoint usage:", err);
    });
  }

  private async initializeUsage(endpoints: Endpoint[]): Promise<void> {
    for (const endpoint of endpoints) {
      try {
        this.cache.put(endpoint.id, {
          tokensRemaining: endpoint.tokenLimit,
          requestsRemaining: endpoint.requestLimit,
        });
        logger.info(`Initialized usage for endpoint: ${endpoint.id}`);
      } catch (error) {
        logger.error(
          `Error initializing usage for endpoint ${endpoint.id}:`,
          error
        );
      }
    }
  }

  public async getUsage(endpointId: string): Promise<Record<string, any>> {
    try {
      const usage = this.cache.get(endpointId) || {};
      logger.debug(`Fetched usage for endpoint ${endpointId}:`, usage);
      return usage;
    } catch (error) {
      logger.error(`Error getting usage for endpoint ${endpointId}:`, error);
      throw error;
    }
  }

  public async updateUsage(
    endpointId: string,
    tokenCount: number,
    requestsRemaining: number
  ): Promise<void> {
    try {
      this.cache.put(endpointId, {
        tokensRemaining: tokenCount,
        requestsRemaining,
      });

      logger.info(
        `Updated usage for endpoint ${endpointId}: tokens=${tokenCount}, requests=${requestsRemaining}`
      );
    } catch (error) {
      logger.error(`Error updating usage for endpoint ${endpointId}:`, error);
      throw error;
    }
  }

  public async getLeastLoadedEndpoint(): Promise<Endpoint> {
    try {
      const loads = await Promise.all(
        this.endpoints.map(async (endpoint) => {
          const usage = await this.getUsage(endpoint.id);
          const tokensRemaining = Number(usage.tokensRemaining) || 0;
          const requestsRemaining = Number(usage.requestsRemaining) || 0;
          const load =
            tokensRemaining / endpoint.tokenLimit +
            requestsRemaining / endpoint.requestLimit;

          return { endpoint, load };
        })
      );

      const sortedLoads = loads
        .filter((load) => !load.endpoint.isPaused)
        .sort((a, b) => b.load - a.load);

      if (sortedLoads.length === 0) {
        logger.warn(
          "All endpoints are paused. Waiting for an available one..."
        );

        return new Promise((resolve) => {
          const intervalId = setInterval(() => {
            const available = loads
              .filter((load) => !load.endpoint.isPaused)
              .sort((a, b) => b.load - a.load);
            if (available.length > 0) {
              clearInterval(intervalId);
              logger.info(`Recovered endpoint: ${available[0].endpoint.id}`);
              resolve(available[0].endpoint);
            }
          }, 1000);
        });
      } else {
        logger.info(
          `Selected least loaded endpoint: ${sortedLoads[0].endpoint.id}`
        );
        return sortedLoads[0].endpoint;
      }
    } catch (error) {
      logger.error("Error selecting least loaded endpoint:", error);
      throw error;
    }
  }

  public async getServiceEndpoint(): Promise<{
    url: string;
    id: string;
    key: string;
  }> {
    try {
      const endpoint = await this.getLeastLoadedEndpoint();
      const usage = await this.getUsage(endpoint.id);

      const tokensRemaining = Number(usage.tokensRemaining);
      const requestsRemaining = Number(usage.requestsRemaining);

      if (
        tokensRemaining <= endpoint.tokenLimit &&
        requestsRemaining - 1 <= endpoint.requestLimit
      ) {
        logger.info(`Providing service endpoint: ${endpoint.id}`);
        return { url: endpoint.url, id: endpoint.id, key: endpoint.key };
      } else {
        logger.warn(
          `Rate limited on endpoint ${endpoint.id} TokensRemaining: ${tokensRemaining}/${endpoint.tokenLimit}, RequestsRemaining : ${requestsRemaining}/${endpoint.requestLimit}. Retrying...`
        );
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 100ms
        return this.getServiceEndpoint();
      }
    } catch (error) {
      logger.error("Error getting service endpoint:", error);
      throw error;
    }
  }
}

export default AzureOpenAIRequestDistributor;
