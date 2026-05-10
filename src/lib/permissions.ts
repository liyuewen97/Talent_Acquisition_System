export const USER_ROLES = {
  ADMIN: "ADMIN",
  ASSISTANT: "ASSISTANT",
  INTERN: "INTERN",
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export function canAccessAllCandidates(role: UserRole) {
  return role === USER_ROLES.ADMIN || role === USER_ROLES.ASSISTANT;
}

export function canEditAllCandidates(role: UserRole) {
  return role === USER_ROLES.ADMIN || role === USER_ROLES.ASSISTANT;
}

export function canViewCandidateForIntern(params: {
  role: UserRole;
  userId: string;
  candidateCreatedBy: string;
  currentFollowUserId: string | null;
  followUpUserIds: string[];
}) {
  if (canAccessAllCandidates(params.role)) {
    return true;
  }

  if (params.role !== USER_ROLES.INTERN) {
    return false;
  }

  if (params.candidateCreatedBy === params.userId) {
    return true;
  }

  if (params.currentFollowUserId === params.userId) {
    return true;
  }

  return params.followUpUserIds.includes(params.userId);
}
