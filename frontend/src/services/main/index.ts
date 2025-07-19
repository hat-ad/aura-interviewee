import axios, { AxiosError } from "axios";

import type { ServiceResponse } from "@/types/common";
import instance, { RETRY_DELAY, RETRY_LIMIT } from "./config";

export const getService = async (
  url: string,
  params?: Record<string, unknown>,
  headers?: Record<string, unknown>,
  signal?: AbortSignal
) => {
  try {
    const response = await instance.get(url, {
      params,
      headers: { Accept: "application/json", ...headers },
      signal,
    });
    return {
      status: response?.data?.success,
      data: response?.data?.data,
      message: response?.data?.message,
    };
  } catch (e) {
    if (e instanceof AxiosError) {
      return {
        status: false,
        data: null,
        message: e?.response?.data?.message || "Network Error",
      };
    }
    return {
      status: false,
      data: null,
      message: "Something went wrong, please try again later",
    };
  }
};

export const postService = async (
  url: string,
  data: Record<string, unknown> | FormData,
  params?: Record<string, unknown>,
  headers?: Record<string, unknown>
) => {
  try {
    const response = await instance.post(url, data, {
      headers: {
        "Content-Type":
          data instanceof FormData ? "multipart/formdata" : "application/json",
        ...headers,
      },
      params,
    });

    return {
      status: response?.data?.success,
      data: response?.data?.data,
      message: response?.data?.message,
    };
  } catch (e) {
    if (e instanceof AxiosError) {
      return {
        status: false,
        data: null,
        message: e?.response?.data?.message || "Network Error",
      };
    }
    return {
      status: false,
      data: null,
      message: "Something went wrong, please try again later",
    };
  }
};

export const deleteService = async (
  url: string,
  params?: Record<string, unknown>,
  data?: Record<string, unknown>
) => {
  try {
    const response = await instance.delete(url, {
      data,
      params,
    });

    return {
      status: response?.data?.success,
      data: response?.data?.data,
      message: response?.data?.message,
    };
  } catch (e) {
    if (e instanceof AxiosError) {
      return {
        status: false,
        data: null,
        message: e?.response?.data?.message || "Network Error",
      };
    }
    return {
      status: false,
      data: null,
      message: "Something went wrong, please try again later",
    };
  }
};

export const putService = async (
  url: string,
  data: Record<string, unknown> | FormData,
  params?: Record<string, unknown>
) => {
  try {
    const response = await instance.put(url, data, {
      headers: {
        "Content-Type":
          data instanceof FormData ? "multipart/formdata" : "application/json",
      },
      params,
    });

    return {
      status: response?.data?.success,
      data: response?.data?.data,
      message: response?.data?.message,
    };
  } catch (e) {
    if (e instanceof AxiosError) {
      return {
        status: false,
        data: null,
        message: e?.response?.data?.message || "Network Error",
      };
    }
    return {
      status: false,
      data: null,
      message: "Something went wrong, please try again later",
    };
  }
};

export const uploadService = async (
  file: File,
  onUploadProgress: (progress: number) => void,
  uploadUrl: string,
  headers?: Record<string, string>
): Promise<{
  status: boolean;
  data: string;
  message: string;
}> => {
  let attempt = 0;

  while (attempt <= RETRY_LIMIT) {
    try {
      const config = {
        headers: headers,
        onUploadProgress: ({
          loaded,
          total,
        }: {
          loaded: number;
          total?: number;
        }) => {
          if (total) {
            const progress = (loaded / total) * 100;
            onUploadProgress(parseFloat(progress.toFixed(2)));
          } else {
            const estimatedProgress = (loaded / file.size) * 100;
            onUploadProgress(parseFloat(estimatedProgress.toFixed(2)));
          }
        },
      };

      await axios.put(uploadUrl, file, config);

      return {
        status: true,
        data: uploadUrl,
        message: "File uploaded successfully",
      };
    } catch (error) {
      attempt++;

      console.error(`Attempt ${attempt} failed:`, error);

      // Check if retries are exhausted
      if (attempt >= RETRY_LIMIT) {
        if (error instanceof AxiosError) {
          return {
            status: false,
            data: "",
            message: error?.response?.data?.message || "Network Error",
          };
        }

        return {
          status: false,
          data: "",
          message: "An error occurred during the file upload after retries",
        };
      }

      console.log(`Retrying upload... Attempt ${attempt}/${RETRY_LIMIT}`);
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
    }
  }

  return {
    status: false,
    data: "",
    message: "Failed to upload file after multiple attempts",
  };
};

export const downloadService = async (
  url: string,
  data: Record<string, unknown>,
  filename: string,
  params?: Record<string, unknown>,
  headers?: Record<string, unknown>
): Promise<ServiceResponse<null>> => {
  try {
    const response = await instance.post(url, data, {
      headers: { ...headers, "Content-Type": "application/json" },
      responseType: "blob",
      params,
    });

    const blob = new Blob([response.data]);
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    return {
      status: true,
      data: null,
      message: "File downloaded successfully",
    };
  } catch (error) {
    if (error instanceof AxiosError) {
      return {
        status: false,
        data: null,
        message: error?.response?.data?.message || "Network Error",
      };
    }
    return {
      status: false,
      data: null,
      message: "An error occurred during the file download",
    };
  }
};
