import re
from playwright.async_api import async_playwright
import asyncio, json, requests

async def get_data():
    sources = None
    starter = None
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36")
        page = await context.new_page()
        try:
            async def handle_response(response):
                nonlocal sources, starter
                if 'YDGUTEY' in response.url and response.request.method == 'POST':
                    sources = await response.text()
                    url_parts = response.url.split('YDGUTEY')
                    starter = f'{url_parts[0]}xo8XtbY-sVen/'

            page.on("response", handle_response)
            
            await page.goto(f"https://vidfast.pro/movie/123?autoPlay=false")
            
            await asyncio.wait_for(page.wait_for_load_state('networkidle'), timeout=10.0)
            return json.loads(sources), starter
            
        finally: await browser.close()

sources, starter = asyncio.run(get_data())
print(sources, '\n')
print(starter, '\n')

def get_source(sources, source_name, starter):
    for source in sources:
        if source['name'] == source_name:
            return requests.post(f"{starter}{source['data']}").text

source_data = get_source(sources, 'Alpha', starter)
print(source_data)