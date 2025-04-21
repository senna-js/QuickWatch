import requests, re, json, xml.etree.ElementTree as ET
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

r = requests.get(f"https://www.wcostream.tv{options[choice][1].replace('anime', 'playlist-cat')}")
soup = BeautifulSoup(r.text, "html.parser")
script = soup.find("script", type="text/javascript", text=re.compile(r'/playlist-cat-rss/'))
stuff = re.search(r'jw.load\("(.+)"\);', script.text).group(1)

r = requests.get(f"https://www.wcostream.tv{stuff}")
xml_content = r.text

def parse_xml_to_episodes(xml_content, show_name):
    episodes = []
    
    try:
        xml_content = re.sub(r'<!\[CDATA\[(.*?)\]\]>', r'\1', xml_content)
        
        root = ET.fromstring(xml_content)
        
        for item in root.findall('.//item'):
            if options[choice][0] not in item.find('title').text: continue
            title_elem = item.find('title')
            description_elem = item.find('description')
            mediaid_elem = item.find('mediaid')
            
            jwplayer_ns = {'jwplayer': 'http://rss.jwpcdn.com/'}
            image_elem = item.find('.//jwplayer:image', jwplayer_ns)
            source_elem = item.find('.//jwplayer:source', jwplayer_ns)
            
            if title_elem is not None and source_elem is not None:
                title_text = title_elem.text
                
                episode_data = {
                    "title": None,
                    "episode_number": None,
                    "season_number": 1,
                    "multiple_eps": False,
                    "description": description_elem.text if description_elem is not None else None,
                    "mediaid": mediaid_elem.text if mediaid_elem is not None else None,
                    "image": image_elem.text if image_elem is not None else None,
                    "video_url": source_elem.get('file') if source_elem is not None else None
                }
                
                raw_title = title_text.replace(f"{show_name} ", "")
                
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
                    episode_data["title"] = match.group(2).strip()
                elif match := re.match(pattern2, raw_title):
                    episode_data["season_number"] = int(match.group(1))
                    episode_data["episode_number"] = int(match.group(2))
                    episode_data["title"] = match.group(3).strip()
                elif match := re.match(pattern3, raw_title):
                    episode_data["season_number"] = int(match.group(1))
                    episode_data["episode_number"] = int(match.group(2))
                    episode_data["title"] = match.group(3).strip()
                elif match := re.match(pattern4, raw_title):
                    start_ep = int(match.group(1))
                    end_ep = int(match.group(2))
                    episode_data["episode_number"] = False
                    episode_data["title"] = match.group(3).strip()
                    episode_data["multiple_eps"] = list(range(start_ep, end_ep + 1))
                elif match := re.match(pattern5, raw_title):
                    start_ep = int(match.group(1))
                    end_ep = int(match.group(2))
                    titles = match.group(3).split("/")
                    episode_data["episode_number"] = False
                    episode_data["title"] = titles[0].strip()
                    episode_data["multiple_eps"] = list(range(start_ep, end_ep + 1))
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
                        episodes.append(first_episode)
                        
                        second_episode = episode_data.copy()
                        second_episode["season_number"] = int(match.group(1))
                        second_episode["episode_number"] = end_ep
                        second_episode["episode_title"] = titles[1].strip()
                        second_episode["title"] = titles[1].strip()
                        episodes.append(second_episode)
                        
                        continue
                    else:
                        episode_data["season_number"] = int(match.group(1))
                        episode_data["episode_number"] = False
                        episode_data["episode_title"] = match.group(4).strip()
                        episode_data["title"] = match.group(4).strip()
                        episode_data["multiple_eps"] = list(range(start_ep, end_ep + 1))
                else:
                    print(f"Could not match title: '{raw_title}'")
                    episode_data["title"] = raw_title
                
                episodes.append(episode_data)
    
    except Exception as e:
        print(f"Error parsing XML: {e}")
    
    return episodes

show_name = options[choice][0]
episodes = parse_xml_to_episodes(xml_content, show_name)

json_output = json.dumps(episodes, indent=2)