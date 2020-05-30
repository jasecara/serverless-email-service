# Email Service

Serverless Cloud Formation Stack to standardize sending of email for an AWS organization, backed by AWS SES. 
Once deployed, you can send email via a simple POST to the exposed endpoint. You can additionally track the status of an
outbound email via the provisioned DynamoDB Record Table. For compliance and auditing purposes, once the configurable 
lifecycle period has expired records are automatically deleted.

## Setup

### Adding / Verifying Domain for SES
In order to use this service, you have at least one domain setup for Amazon Simple Email Service(SES) which has completed verification.

More Info: [Verify Domain On AWS for SES](https://docs.aws.amazon.com/ses/latest/DeveloperGuide/verify-domains.html)

### Deploying Cloud Formation Stack
Serverless is used to prepare and deploy this Cloud Formation Stack to AWS.
You can learn more about serverless framework and how to quickly [get started here](https://www.serverless.com/framework/docs/getting-started/).
 
Once you have verified serverless framework is installed and added your aws profile, you can deploy the stack to cloud formation

```
sls deploy
```

You can additionally deploy to other stages by passing an optional stage parameter value
```
sls deploy --stage=dev
sls deploy --stage=qa
sls deploy --stage=prd
```

### Enabling Email Status Notifications
Once your stack is deployed, you must add a destination to SES configuration so that emails can be tracked
when events occur (IE Delivered, Bounced, Opened).

1. Navigate to "Configuration Sets" and select the one named "email-service-{stage}-notification-configuration-set".
2. Select Add Destination.
3. Enter "new-notification-topic" or something similar for the name.
4. Select which email event types you would like to listen for.
5. Select the SNS ARN for delivery notifications created by the stack. (email-service-dev-notification on DEV stage)

### Sending Email

Once you've deployed the service, you can send an email by issuing a POST request to the send endpoint.

```
POST https://${API_ID}.execute-api.us-east-1.amazonaws.com/dev/send
Content-Type: application/json

{
  "from": "noreply@example.com",
  "subject": "This is the subject of the email",
  "content": {
    "text": "This is the plain text email content",
    "html": "<html><body><h1>This is the html email content</h1></body></html>"
  },
  "recipients": {
    "to": [
      {
        "email": "jim@example.com",
        "name": "Jim Halpert"
      }
    ],
    "cc": [
      {
        "email": "stanley@example.com",
        "name": "Stanley Hudson"
      }
    ],
    "bcc": [
      {
        "email": "dwight@example.com",
        "name": "Dwight Schrute"
      }
    ]
  }
}

```
