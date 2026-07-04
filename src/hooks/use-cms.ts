import { queryOptions, useQuery } from "@tanstack/react-query";
import { getSiteContent, getMyRole } from "@/lib/cms.functions";

export const siteContentQuery = queryOptions({
  queryKey: ["site-content"],
  queryFn: () => getSiteContent(),
  staleTime: 30_000,
});

export function useSiteContent() {
  return useQuery(siteContentQuery);
}

export const myRoleQuery = queryOptions({
  queryKey: ["my-role"],
  queryFn: () => getMyRole(),
  retry: false,
  staleTime: 10_000,
});
