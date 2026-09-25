export type PermissionType = 'microphone' | 'camera';
export type PermissionChoice = 'while_using' | 'only_this_time' | 'block';

export function getStoredPermission(type: PermissionType): PermissionChoice | 'prompt' {
  if (typeof window === 'undefined') return 'prompt';

  const localVal = localStorage.getItem(`nexus_perm_${type}`) as PermissionChoice | null;
  if (localVal === 'while_using' || localVal === 'block') {
    return localVal;
  }

  const sessionVal = sessionStorage.getItem(`nexus_perm_${type}`) as PermissionChoice | null;
  if (sessionVal === 'only_this_time') {
    return 'only_this_time';
  }

  return 'prompt';
}

export function savePermissionChoice(type: PermissionType, choice: PermissionChoice): void {
  if (typeof window === 'undefined') return;

  if (choice === 'while_using') {
    localStorage.setItem(`nexus_perm_${type}`, 'while_using');
  } else if (choice === 'block') {
    localStorage.setItem(`nexus_perm_${type}`, 'block');
  } else if (choice === 'only_this_time') {
    sessionStorage.setItem(`nexus_perm_${type}`, 'only_this_time');
    localStorage.removeItem(`nexus_perm_${type}`);
  }
}

export function resetPermission(type: PermissionType): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(`nexus_perm_${type}`);
  sessionStorage.removeItem(`nexus_perm_${type}`);
}
