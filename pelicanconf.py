PUBLISH_VERSION = False

AUTHOR = "Степан Захаров"
SITENAME = "stepanzh"
SITEURL = ""

PATH = "content"

TIMEZONE = "Europe/Moscow"

DEFAULT_LANG = "ru"

# Feed generation is usually not desired when developing
FEED_ALL_ATOM = None
CATEGORY_FEED_ATOM = None
TRANSLATION_FEED_ATOM = None
AUTHOR_FEED_ATOM = None
AUTHOR_FEED_RSS = None

# Blogroll
LINKS = (
    ("Pelican", "https://getpelican.com/"),
    ("Python.org", "https://www.python.org/"),
    ("Jinja2", "https://palletsprojects.com/p/jinja/"),
    ("You can modify those links in your config file", "#"),
)

COMMON_LINKS = {
    "telegram-channel": "https://t.me/stepanzh_blog",
    "proportio": "https://stepanzh.github.io/Proportio"
}

# Social widget
SOCIAL = (
    ("You can add links in your config file", "#"),
    ("Another social link", "#"),
)

DEFAULT_PAGINATION = False

# Extra statics.
ARTICLE_EXCLUDES = ["extra"]
STATIC_PATHS = ["extra/robots.txt", "extra/favicon.ico", "extra/apple-touch-icon.png", "extra/yandex_14d8631f799e8d1b.html"]
EXTRA_PATH_METADATA = {
    "extra/robots.txt": {"path": "robots.txt"},
    "extra/favicon.ico": {"path": "favicon.ico"},
    "extra/apple-touch-icon.png": {"path": "apple-touch-icon.png"},
    "extra/yandex_14d8631f799e8d1b.html": {"path": "yandex_14d8631f799e8d1b.html"},
}

# Uncomment following line if you want document-relative URLs when developing
# RELATIVE_URLS = True
THEME = "theme"

# Navigation bar a.k.a. menu.
DISPLAY_PAGES_ON_MENU = True
PAGE_ORDER_BY = "navorder"  # Custom attribute to order pages in navigation bar.
DISPLAY_CATEGORIES_ON_MENU = False

# Disable unnecessary generated content.
ARCHIVES_SAVE_AS = False
AUTHOR_SAVE_AS = False
AUTHORS_SAVE_AS = False
CATEGORIES_SAVE_AS = False
CATEGORY_SAVE_AS = False
TAGS_SAVE_AS = False
