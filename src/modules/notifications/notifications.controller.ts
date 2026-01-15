import { Controller, Sse, Query } from '@nestjs/common';
import { map, EMPTY } from 'rxjs';
import { NotificationsGateway } from './notifications.gateway';
import { Public } from '../../auth/public.decorator';

@Controller('v1/notifications')
export class NotificationsController {
    constructor(private gateway: NotificationsGateway) { }
    @Public()
    @Sse('stream')
    stream(
        @Query('tenantId') tenantId?: string,
        @Query('userId') userId?: string,
    ) {

        if (!tenantId || !userId) {
            return EMPTY;
        }

        const stream$ = this.gateway.getStream(tenantId, userId);

        return stream$.pipe(
            map(event => ({
                type: 'message',
                data: event,
            })),
        );
    }
}
