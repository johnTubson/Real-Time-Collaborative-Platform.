import { UserPublicProfileDto } from "#modules/users/dtos/user-public-profile.dto.js";
import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { Request } from "express";

export interface ContextWithAuthenticatedUser {
  req: RequestWithUser;
}

export interface RequestWithUser extends Request {
  user: undefined | UserPublicProfileDto;
}

export const CurrentUser = createParamDecorator((data: unknown, context: ExecutionContext) => {
  const request = context.switchToHttp().getRequest<ContextWithAuthenticatedUser>();
  return request.req.user;
});
