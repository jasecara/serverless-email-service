# Email Service

The purpose of this service is to send email from a central api across your entire aws cloud infrastructure
in order to easily control application use and compliance. While currently leveraging SES, other email providers can
be added in order to provide a fallback strategy for outbound email should the primary provider
become unavailable / disabled due to email reputation or connectivity issues.

All outbound emails are tracked in a Dynamo DB Table with a life cycle policy set to delete records after required data
retention period has expired.

Notification tracking is handled via SES events with an SNS endpoint, which is backed by a queue
and dead letter queue for message replay and or retrieval when errors occur.

##Setup

### Adding / Verifying Domain for SES
First, ensure you have at least one domain setup for Amazon Simple Email Service(SES) which has completed verification.
Any domain you send from must be verified and added before you can use it.
For more information, see: https://docs.aws.amazon.com/ses/latest/DeveloperGuide/verify-domains.html

### Deploying Cloud Formation Stack
Next, make sure you have serverless framework installed in order to prepare and deploy your cloud formation stack to AWS

```
npm install -g serverless
```

Now you can generate and deploy the stack to cloud formation.
```
sls deploy
```

Your stack will now be deployed to Cloud Formation. You can change the deployment stage
and additional actions by passing optional parameters.

For more information see: https://www.serverless.com/framework/docs/providers/aws/cli-reference/deploy/

### Enabling Email Status Notifications
Once your stack is deployed, head to the SES page in your AWS Console.
Navigate to "Configuration Sets" and select the one named "email-service-dev-notification-configuration-set".
Select Add Destination. Enter "new-notification-topic", check which email event types you would like to listen for, 
and then select the SNS ARN for delivery notifications created by the stack. (email-service-dev-notification on DEV stage)

### Sending Email

Once you've deployed the service, you can send emails by performing a POST to the send endpoint of service.

```
POST {$APISendEndpoint}/dev/send
Content-Type: application/json

{
  "from": "noreply@example.com",
  "subject": "This is the subject of the email",
  "content": {
    "text": "This is the plain text content of the email.",
    "html": "<html><body><h1>HTML Version</h1><h2>This is the html content of email</h2></body></html>"
  },
  "recipients": {
    "to": [
      {
        "email": "joe@example.com",
        "name": "Joe Somebody"
      }
    ],
    "cc": [
      {
        "email": "peter@gmail.com",
        "name": "Peter Person"
      }
    ],
    "bcc": [
      {
        "email": "sally@example.com",
        "name": "Sally Secrets"
      }
    ]
  },
  "attachments": []
}
```