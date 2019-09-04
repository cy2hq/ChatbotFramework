const { ActivityHandler } = require('botbuilder');
const { CardFactory } = require('botbuilder');

class Holly extends ActivityHandler {
    constructor(conversationState, userState, dialog) {
        super();
        if (!conversationState) throw new Error('[Holly]: Missing parameter. conversationState is required.');
        if (!userState) throw new Error('[Holly]: Missing parameter. userState is required');
        if (!dialog) throw new Error('[Holly]: Missing parameter. dialog is required');

        this.conversationState = conversationState;
        this.userState = userState;
        this.dialog = dialog;
        this.dialogState = this.conversationState.createProperty('DialogState');

        this.onMessage(async (context, next) => {
            console.log('Running dialog with Message Activity.');
            await this.dialog.run(context, this.dialogState);
            await next();
        });

        this.onMembersAdded(async (context, next) => {
            const membersAdded = context.activity.membersAdded;
            for (let cnt = 0; cnt < membersAdded.length; ++cnt) {
                if (membersAdded[cnt].id !== context.activity.recipient.id) {
                    const reply = { attachments:
                        [CardFactory.heroCard(
                            `It's ya gurl Holly. Please enter your name to continue.`,
                            '',
                            ['http://jstmedia.nl/img/stg/avatar.png'],
                            []
                        )] };
                    await context.sendActivity(reply);
                }
            }
            await next();
        });

        this.onDialog(async (context, next) => {
            await this.conversationState.saveChanges(context, false);
            await this.userState.saveChanges(context, false);
            await next();
        });
    }
}

module.exports.Holly = Holly;
