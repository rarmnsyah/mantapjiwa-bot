import os
import json
import requests

BOT_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN")
API_URL = f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage"

def handler(event, context):
    try:
        body = json.loads(event['body'])

        chat_id = body["message"]["chat"]["id"]
        text = body["message"]["text"]

        # Example processing: reverse the input text
        response_text = f"Processed: {text[::-1]}"

        # Send a reply back to the same chat
        requests.post(API_URL, json={"chat_id": chat_id, "text": response_text})

        return {
            "statusCode": 200,
            "body": json.dumps({"ok": True})
        }
    except Exception as e:
        return {
            "statusCode": 400,
            "body": json.dumps({"error": str(e)})
        }
    