import asyncio
from playwright.async_api import async_playwright

async def main():
    m3u8_url = None
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        
        async def handle_response(response):
            nonlocal m3u8_url
            if "video.m3u8?token=" in response.url:
                m3u8_url = response.url

        page.on("response", handle_response)
        
        await page.goto("https://onflix.ovh/tt30324320")
        await page.set_content(f'<iframe src="https://onflix.ovh/tt30324320" style="width: 100%; height: 100vh"></iframe>')
        
        frame = await page.query_selector('iframe')
        
        if frame:
            frame_context = await frame.content_frame()
            if frame_context: await frame_context.click('.redirect')
        
        while not m3u8_url:
            await asyncio.sleep(0.1)
            
        return m3u8_url

print(asyncio.run(main()))