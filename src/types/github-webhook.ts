// GitHub webhook payload types
export interface GitHubUser {
  login: string;
  id: number;
  avatar_url: string;
  url: string;
  html_url: string;
}

export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  owner: GitHubUser;
  html_url: string;
  description: string | null;
  default_branch: string;
}

export interface GitHubCommit {
  id: string;
  message: string;
  timestamp: string;
  url: string;
  author: {
    name: string;
    email: string;
    username?: string;
  };
}

export interface GitHubWorkflowRun {
  id: number;
  name: string;
  head_branch: string;
  head_sha: string;
  run_number: number;
  event: string;
  status: string;
  conclusion: string | null;
  workflow_id: number;
  check_suite_id: number;
  url: string;
  html_url: string;
  created_at: string;
  updated_at: string;
}

export interface GitHubCheckRun {
  id: number;
  name: string;
  status: string;
  conclusion: string | null;
  started_at: string;
  completed_at: string | null;
  html_url: string;
}

export interface GitHubWorkflowRunEvent {
  action: string;
  workflow_run: GitHubWorkflowRun;
  repository: GitHubRepository;
  sender: GitHubUser;
}

export interface GitHubCheckSuiteEvent {
  action: string;
  check_suite: {
    id: number;
    head_branch: string;
    head_sha: string;
    status: string;
    conclusion: string | null;
    url: string;
    before: string;
    after: string;
    pull_requests: any[];
    app: {
      id: number;
      name: string;
      slug: string;
    };
    created_at: string;
    updated_at: string;
  };
  repository: GitHubRepository;
  sender: GitHubUser;
}

export type GitHubWebhookEvent = 
  | GitHubWorkflowRunEvent 
  | GitHubCheckSuiteEvent; 