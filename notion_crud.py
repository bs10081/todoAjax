
import requests


class NotionCRUD:
    def __init__(self, api_key, database_url):
        self.api_key = api_key
        self.database_url = database_url
        self.database_id = database_url.split('/')[-1]
        self.headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "Notion-Version": "2021-08-16"
        }

    def get_todos(self):
        response = requests.post(self.database_url, headers=self.headers)
        results = response.json().get('results')
        todos = [{
            'id': item['id'],
            'text': item['properties']['Text']['rich_text'][0]['plain_text'] if item['properties']['Text']['rich_text'] else "",
            'completed': item['properties']['Completed']['checkbox'],
            'date': item['properties']['Date']['date']['start'] if item['properties']['Date']['date'] else None,
            'urgency': item['properties']['Urgency']['select']['name'] if item['properties']['Urgency']['select'] else None
        } for item in results]
        return todos

    def create_todo(self, text, completed=False, date=None, urgency=None):
        data = {
            "parent": {"database_id": self.database_id},
            "properties": {
                "Text": {"rich_text": [{"text": {"content": text}}]},
                "Completed": {"checkbox": completed}
            }
        }
        if date:
            data["properties"]["Date"] = {"date": {"start": date}}
        if urgency:
            data["properties"]["Urgency"] = {"select": {"name": urgency}}

        response = requests.post(
            "https://api.notion.com/v1/pages", headers=self.headers, json=data)
        print(response.status_code)
        print(response.json())
        return response.json()

    def update_todo(self, todo_id, text=None, completed=None, date=None, urgency=None):
        data = {"properties": {}}
        if text is not None:
            data["properties"]["Text"] = {
                "rich_text": [{"text": {"content": text}}]}
        if completed is not None:
            data["properties"]["Completed"] = {"checkbox": completed}
        if date:
            data["properties"]["Date"] = {"date": {"start": date}}
        if urgency:
            data["properties"]["Urgency"] = {"select": {"name": urgency}}

        response = requests.patch(
            f"https://api.notion.com/v1/pages/{todo_id}", headers=self.headers, json=data)
        return response.json()

    def delete_todo(self, todo_id):
        data = {
            "archived": True
        }
        response = requests.patch(
            f"https://api.notion.com/v1/pages/{todo_id}", headers=self.headers, json=data)
        return response.json()
