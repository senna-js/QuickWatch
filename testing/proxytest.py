import requests, time

url = "https://varunaditya.xyz/api/proxy"
payload = {
    'url': 'https://proxy-3.onionflixer.cc/buDUJS8n-HToQbtgC2E_DrlsavZhgobnVDnRD-mwkjbKq3I2xMQX5J268ERpwENjRVXvuRxk45KEkH_qdqBxBg/xtUKcZS52zwywpkanagZGn8CeRm5KQ83ffegFIFivMU/video.m3u8?token=4XaHPLSSwAUe9bnLMeGpQUvSKPazY5V2Mr7yfvo_wf0',
    'method': 'GET',
    'headers': {
        'referer': 'https://onionflixer.com/'
    }
}

start = time.time()
response = requests.post(url, json=payload, headers={'Origin': 'http://localhost:5173'})
print(response.text)
print(time.time() - start)