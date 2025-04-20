import requests
from bs4 import BeautifulSoup

query = "gumball"
url = "https://www.wcostream.tv/search"
payload = {
    "catara": query,
    "konuara": "series"
}

r = requests.post(url, data=payload)

soup = BeautifulSoup(r.text, "html.parser")
links = soup.find_all("div", class_="iccerceve")

options = []

print("Choose one:")
for index, link in enumerate(links):
    title = link.find("a")["title"]
    href = link.find("a")["href"]
    options.append((title, href))
    print(f"{index + 1}. {title}")

choice = int(input("Enter the number of your choice: ")) - 1

print("Link:", options[choice][1])