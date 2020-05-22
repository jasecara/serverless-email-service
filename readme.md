# Email Service

## About

The purpose of this service is to send email from a central api across entire cloud infrastructure
in order to easily control application use and compliance. While currently leveraging SES, other email providers can
be added in order to provide a fallback strategy for outbound email should the primary provider
become unavailable / disabled due to email reputation.

All outbound emails are tracked in a Dynamo DB Table with a life cycle policy set to delete records after required data
retention period has expired.

In order to enable notification update for email (for example, delivery / bounce / open notifications)

### Setup
First, ensure you have at least one domain setup for Amazon Simple Email Service(SES) which has completed verification.

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