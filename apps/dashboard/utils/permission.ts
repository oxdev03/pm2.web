interface IPermissionConstants {
  LOGS: number;
  MONITORING: number;
  SETTINGS: number;
  RESTART: number;
  STOP: number;
  DELETE: number;
}

const PERMISSIONS: IPermissionConstants = {
  LOGS: 0,
  MONITORING: 1,
  SETTINGS: 2,
  RESTART: 3,
  STOP: 4,
  DELETE: 5,
};

class Permission {
  private constants = PERMISSIONS;

  value: number;

  constructor(value = 0) {
    this.value = value;
  }

  get perms(): IPermissionConstants {
    return this.constants;
  }

  toggle(...perms: number[]) {
    this.loop(perms, (perm) => {
      this.value ^= 1 << perm;
    });

    return this;
  }

  add(...perms: number[]) {
    this.loop(perms, (perm) => {
      this.value |= 1 << perm;
    });

    return this;
  }

  remove(...perms: number[]) {
    this.loop(perms, (perm) => {
      this.value &= ~(1 << perm);
    });

    return this;
  }

  inherit(...perms: number[]) {
    this.loop(perms, (perm) => {
      this.value |= perm;
    });

    return this;
  }

  private loop(perms: number[], fn: (perm: number) => void) {
    for (const perm of perms) {
      fn(perm);
    }
  }

  has(...perms: number[]): boolean {
    for (const perm of perms) {
      if (!((this.value & (1 << perm)) !== 0)) {
        return false;
      }
    }
    return true;
  }

  hasOne(perms: number[]): boolean {
    for (const perm of perms) {
      if (this.has(perm)) {
        return true;
      }
    }
    return false;
  }

  static common(...perms: number[]): number[] {
    const commonPermissions: number[] = [];
    for (const key in PERMISSIONS) {
      const perm = PERMISSIONS[key as keyof IPermissionConstants];
      if (perms.every((p) => (p & (1 << perm)) !== 0)) {
        commonPermissions.push(perm);
      }
    }
    return commonPermissions;
  }

  toArray(): (keyof IPermissionConstants)[] {
    return Object.entries(this.constants)
      .filter(([, value]) => this.has(value))
      .map(([key]) => key as keyof IPermissionConstants);
  }
}

export default Permission;

export { Permission, PERMISSIONS };

export type { IPermissionConstants };
