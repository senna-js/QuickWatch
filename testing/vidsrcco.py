import requests

cookies = {
    'OptanonConsent': 'isGpcEnabled=0&datestamp=Wed+Apr+30+2025+01%3A06%3A32+GMT%2B0200+(Central+European+Summer+Time)&version=202310.2.0&browserGpcFlag=0&isIABGlobal=false&hosts=&landingPath=NotLandingPage&groups=C0004%3A0%2CC0003%3A0%2CC0002%3A0%2CC0001%3A1&AwaitingReconsent=false'
}

r = requests.get("https://player.vidsrc.co/api/server?id=40075&sr=1&ep=1&ss=1", cookies=cookies)
print(r.text)