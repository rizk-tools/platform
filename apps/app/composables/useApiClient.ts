import apiClient from "@rizk/api-client";

export default function () {
  const client = apiClient("/");

  return client;
};
