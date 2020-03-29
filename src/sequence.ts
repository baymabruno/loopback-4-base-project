import {inject} from '@loopback/context';
import {
  FindRoute,
  InvokeMethod,
  ParseParams,
  Reject,
  RequestContext,
  RestBindings,
  Send,
  SequenceHandler,
} from '@loopback/rest';
import {log} from './services/log.service';

const SequenceActions = RestBindings.SequenceActions;

export class ProjectSequence implements SequenceHandler {
  constructor(
    @inject(SequenceActions.FIND_ROUTE) protected findRoute: FindRoute,
    @inject(SequenceActions.PARSE_PARAMS) protected parseParams: ParseParams,
    @inject(SequenceActions.INVOKE_METHOD) protected invoke: InvokeMethod,
    @inject(SequenceActions.SEND) public send: Send,
    @inject(SequenceActions.REJECT) public reject: Reject,
  ) {}

  async handle(context: RequestContext) {
    try {
      const {request, response} = context;
      const route = this.findRoute(request);

      const logMessage = {
        ip: request.ip,
        method: request.method,
        router: request.path,
      };

      log.info(JSON.stringify(logMessage));

      const args = await this.parseParams(request, route);
      const result = await this.invoke(route, args);

      const params = await this.parseParams(context.request, route);
      log.debug(JSON.stringify({params}));

      this.send(response, result);
    } catch (error) {
      log.error(`${error.stack} \n ${JSON.stringify({error}, null, 2)}`);
      this.reject(context, error);
    }
  }
}
