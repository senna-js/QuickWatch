import requests, re, json
from bs4 import BeautifulSoup

query = "gumball"

r = requests.post("https://www.wcostream.tv/search", data={ "catara": query, "konuara": "series" })

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

r = requests.get(f"https://www.wcostream.tv{options[choice][1]}")
soup = BeautifulSoup(r.text, "html.parser")
titles_list = soup.select("#catlist-listview > ul > li > a")
titles_data = []
for title in titles_list:
    raw_title = title["title"].replace(f"Watch {options[choice][0]} ", "")
    if not title["title"].startswith(f"Watch {options[choice][0]}"): continue
        
    episode_data = { 
        "title": None,
        "href": title["href"], 
        "episode_number": None, 
        "season_number": 1, 
        "episode_title": None,
        "multiple_eps": False 
    }
    
    # Pattern 1: "Episode {epnum} {eptitle}"
    pattern1 = r"Episode (\d+) (.+)"
    # Pattern 2: "Season {seasonnum} {epnum} -{eptitle}"
    pattern2 = r"Season (\d+) (\d+) -(.+)"
    # Pattern 3: "Season {seasonnum} Episode {epnum} {eptitle}"
    pattern3 = r"Season (\d+) Episode (\d+) (.+)"
    # Pattern 4: "The Episode {startinepisode}-{endingepisode} {title}"
    pattern4 = r"The Episode (\d+)-(\d+) (.+)"
    # Pattern 5: "Episode {startep}-{endep} {titles}"
    pattern5 = r"Episode (\d+)-(\d+) (.+)"
    # Pattern 6: "Season {seasonnum} Episode {startep}-{endep} {titles}"
    pattern6 = r"Season (\d+) Episode (\d+)-(\d+) (.+)"
    
    if match := re.match(pattern1, raw_title):
        episode_data["episode_number"] = int(match.group(1))
        episode_data["episode_title"] = match.group(2).strip()
        episode_data["title"] = match.group(2).strip()
        titles_data.append(episode_data)
    elif match := re.match(pattern2, raw_title):
        episode_data["season_number"] = int(match.group(1))
        episode_data["episode_number"] = int(match.group(2))
        episode_data["episode_title"] = match.group(3).strip()
        episode_data["title"] = match.group(3).strip()
        titles_data.append(episode_data)
    elif match := re.match(pattern3, raw_title):
        episode_data["season_number"] = int(match.group(1))
        episode_data["episode_number"] = int(match.group(2))
        episode_data["episode_title"] = match.group(3).strip()
        episode_data["title"] = match.group(3).strip()
        titles_data.append(episode_data)
    elif match := re.match(pattern4, raw_title):
        start_ep = int(match.group(1))
        end_ep = int(match.group(2))
        episode_data["episode_number"] = False
        episode_data["episode_title"] = match.group(3).strip()
        episode_data["title"] = match.group(3).strip()
        episode_data["multiple_eps"] = list(range(start_ep, end_ep + 1))
        titles_data.append(episode_data)
    elif match := re.match(pattern5, raw_title):
        start_ep = int(match.group(1))
        end_ep = int(match.group(2))
        titles = match.group(3).split("/")
        episode_data["episode_number"] = False
        episode_data["title"] = titles[0].strip()
        episode_data["episode_title"] = titles[0].strip()
        episode_data["multiple_eps"] = list(range(start_ep, end_ep + 1))
        titles_data.append(episode_data)
    elif match := re.match(pattern6, raw_title):
        start_ep = int(match.group(2))
        end_ep = int(match.group(3))
        if end_ep - start_ep == 1 and "/" in match.group(4):
            titles = match.group(4).split("/")

            first_episode = episode_data.copy()
            first_episode["season_number"] = int(match.group(1))
            first_episode["episode_number"] = start_ep
            first_episode["episode_title"] = titles[0].strip()
            first_episode["title"] = titles[0].strip()
            titles_data.append(first_episode)
            
            second_episode = episode_data.copy()
            second_episode["season_number"] = int(match.group(1))
            second_episode["episode_number"] = end_ep
            second_episode["episode_title"] = titles[1].strip()
            second_episode["title"] = titles[1].strip()
            titles_data.append(second_episode)
        else:
            episode_data["season_number"] = int(match.group(1))
            episode_data["episode_number"] = False
            episode_data["episode_title"] = match.group(4).strip()
            episode_data["title"] = match.group(4).strip()
            episode_data["multiple_eps"] = list(range(start_ep, end_ep + 1))
            titles_data.append(episode_data)
    else:
        print(f"Could not match title: '{raw_title}'")

s = int(input("Enter the season number: "))
e = int(input("Enter the episode number: "))
for episode in titles_data:
    if episode["season_number"] == s and episode["episode_number"] == e: href = episode["href"]
    elif episode["season_number"] == s and episode["multiple_eps"] and e in episode["multiple_eps"]: href = episode["href"]

print(href)
r = requests.get(href)
soup = BeautifulSoup(r.text, "html.parser")
iframe = soup.find("iframe", attrs={"data-type": "wco-embed"})
src = iframe["src"]
print(iframe)