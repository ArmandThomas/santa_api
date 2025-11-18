import {User} from "../../../feat-auth";
import {Draw} from "../../../feat-draw/lib/draw.dto";
import {EventAccessResult} from "../../../feat-event/lib/access/getEventAccess";

const Mailjet = require('node-mailjet');


export const sendMail = async (
    senderEmail: string,
    recipientEmail: string,
    santaReceiver: User,
    event: EventAccessResult,
    draw: Draw
) => {

    const mailjet = Mailjet.apiConnect(
        process.env.MJ_APIKEY_PUBLIC,
        process.env.MJ_APIKEY_PRIVATE,
        {
            config: {},
            options: {}
        }
    );
    try {
        const request = await mailjet
            .post("send", { version: "v3.1" })
            .request({
                Messages: [
                    {
                        From: {
                            Email: senderEmail,
                        },
                        To: [
                            {
                                Email: recipientEmail,
                            },
                        ],
                        TemplateId : 7499110,
                        TemplateLanguage: true,
                        Variables : {
                            user : {
                                firstname : santaReceiver.firstname,
                                lastname : santaReceiver.lastname
                            },
                            uuid : {
                                link: `https://santa-family.fr/api/uuid/proxy/${draw.uuid}?email=${encodeURIComponent(recipientEmail)}`
                            },
                            object : `${event.name} - Découvrir votre tirage au sort`
                        }
                    },
                ],
            });

        console.log(`https://santa-family.fr/api/uuid/proxy/${draw.uuid}?email=${encodeURIComponent(recipientEmail)}`)
        console.log("Email sent:", request.body, `Vous êtes le secret santa de ${santaReceiver.firstname} - ${santaReceiver.lastname}`);
        return request.body;
    } catch (err: any) {
        console.error("Error sending email:", err.statusCode || err.message);
        throw err;
    }
};

