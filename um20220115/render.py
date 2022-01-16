from collections import namedtuple
from jinja2 import Template

template_path = "index.html.jinja"
songstsv = "songlist.txt"

Song = namedtuple("Song", ["singer", "title"])

with open(template_path) as template_src:
    temp = Template(template_src.read())

with open(songstsv) as file:
    songlist = []
    for line in file:
        singer, title = line.strip().split(" -- ")
        songlist.append(Song(singer, title))
    rendered = temp.render(songlist=songlist)
    print(rendered)
