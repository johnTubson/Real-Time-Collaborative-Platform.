import { UserRole } from "#common/users/enums.js";
import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";

import { ContextWithAuthenticatedUser } from "../decorators/current-user.decorator.js";
import { ROLES_KEY } from "../decorators/roles.decorator.js";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<undefined | UserRole[]>(ROLES_KEY, [context.getHandler(), context.getClass()]);
    if (!requiredRoles || requiredRoles.length === 0) {
      return true; // No roles specified, access granted
    }
    const request = context.switchToHttp().getRequest<ContextWithAuthenticatedUser>();

    const { user } = request.req;

    if (!user?.roles || !Array.isArray(user.roles)) {
      return false; // No user or user has no roles
    }

    return requiredRoles.some((role) => user.roles.includes(role));
  }
}
