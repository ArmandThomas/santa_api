import { Draw } from "../../draw.dto"
import { User, getUserInfo } from "../../../../feat-auth"
import { sendMail } from "../../../../utils/utils-email"
import {EventAccessResult} from "../../../../feat-event/lib/access/getEventAccess";

const SENDER_EMAIL = "contact@santa-family.fr"

export const notifyDrawParticipants = async (
    draws: Draw[],
    event: EventAccessResult
) => {
    for (const draw of draws) {
        try {
            const receiverResult = await getUserInfo(draw.receiver);
            if (!receiverResult.data) {
                console.warn(`Receiver not found for draw ${draw._id}`);
                continue;
            }

            const receiver: User = receiverResult.data;

            const giverResult = await getUserInfo(draw.giver);
            if (!giverResult.data) {
                console.warn(`Giver not found for draw ${draw._id}`);
                continue;
            }

            const giver: User = giverResult.data;

            await sendMail(
                SENDER_EMAIL,
                giver.email,
                receiver,
                event,
                draw
            );

        } catch (err: any) {
            console.error(`Failed to notify draw ${draw._id}:`, err.message);
        }
    }
};
