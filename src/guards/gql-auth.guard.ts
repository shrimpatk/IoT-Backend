// gql-auth.guard.ts
import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class GqlAuthGuard extends AuthGuard('jwt') {
  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    const type = context.getType<any>();

    if (type === 'graphql-subscription') {
      const { connection } = ctx.getContext();
      return connection ? connection.context.req : null;
    }

    return ctx.getContext().req;
  }
}
