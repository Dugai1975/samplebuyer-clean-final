// Original system data structures
export interface OriginalProject {
  uuid: string;
  code: string;
  name: string;
  description?: string;
  total_available?: number;
  count_complete?: number;
  count_accept?: number;
  count_reject?: number;
  count_terminate?: number;
  count_over_quota?: number;
  cpi_buyer?: number;
  state: 'active' | 'closed';
  created_at: string;
  buyer?: OriginalBuyer;
  quotas?: OriginalQuota[];
}

export interface OriginalBuyer {
  name: string;
  complete_link?: string;
  terminate_link?: string;
  quota_link?: string;
  duplicate_link?: string;
  quality_link?: string;
  screenout_link?: string;
  timeout_link?: string;
  redirect_url?: string;
}

export interface OriginalQuota {
  name: string;
  description: string;
  cpi: number;
  complete: number;
  target: number;
  failure: number;
  message: string;
}

export interface OriginalSupplier {
  uuid: string;
  name: string;
}

export interface OriginalSession {
  uuid: string;
  target_code: string;
  respondent_id: string;
  status_detail: string;
  created_at: string;
}
