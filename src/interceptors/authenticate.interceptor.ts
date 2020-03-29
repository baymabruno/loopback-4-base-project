import {
  /* inject, */
  globalInterceptor,
  Interceptor,
  InvocationContext,
  InvocationResult,
  Provider,
  ValueOrPromise,
  inject,
} from '@loopback/context';
import {AuthenticationBindings, AuthenticateFn} from '@loopback/authentication';
import {RestBindings, HttpErrors} from '@loopback/rest';

/**
 * This class will be bound to the application as an `Interceptor` during
 * `boot`
 */
@globalInterceptor('', {tags: {name: 'Authenticate'}})
export class AuthenticateInterceptor implements Provider<Interceptor> {
  constructor(
    @inject(AuthenticationBindings.AUTH_ACTION)
    public authenticateRequest: AuthenticateFn,
  ) {}

  /**
   * This method is used by LoopBack context to produce an interceptor function
   * for the binding.
   *
   * @returns An interceptor function
   */
  value() {
    return this.intercept.bind(this);
  }

  /**
   * The logic to intercept an invocation
   * @param invocationCtx - Invocation context
   * @param next - A function to invoke next interceptor or the target method
   */
  async intercept(
    invocationCtx: InvocationContext,
    next: () => ValueOrPromise<InvocationResult>,
  ) {
    const httpRequest = await invocationCtx.get(RestBindings.Http.REQUEST);

    //call authentication action
    await this.authenticateRequest(httpRequest);

    const result = await next();

    return result;
  }
}
