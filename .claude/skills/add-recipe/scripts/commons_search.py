"""Search Wikimedia Commons for photos and download 400px thumbnails to look at.

    python3 -I commons_search.py "<query>" <outdir> <prefix> [limit]

Prints one line per image: file id | Commons title | size | license | author.
For the chosen photo, fetch a large version via the API (prop=imageinfo,
iiurlwidth=1600) and use the title's file page as the credit URL.
Commons rate-limits; requests are spaced out and retried.
"""
import json
import os
import re
import sys
import time
import urllib.parse
import urllib.request

UA = {'User-Agent': 'KosakovinyRecipeBot/1.0 (personal site)'}


def get(url):
    for i in range(4):
        try:
            return urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=30).read()
        except Exception:
            time.sleep(3 + 3 * i)
    raise SystemExit('failed: ' + url)


def main():
    q, out, pre = sys.argv[1:4]
    limit = int(sys.argv[4]) if len(sys.argv) > 4 else 10
    os.makedirs(out, exist_ok=True)
    params = dict(action='query', format='json', generator='search', gsrnamespace=6, gsrlimit=limit,
                  gsrsearch=q, prop='imageinfo', iiprop='url|size|extmetadata', iiurlwidth=400,
                  iiextmetadatafilter='LicenseShortName|Artist')
    d = json.loads(get('https://commons.wikimedia.org/w/api.php?' + urllib.parse.urlencode(params)))
    pages = sorted(d.get('query', {}).get('pages', {}).values(), key=lambda p: p.get('index', 0))
    for n, p in enumerate(pages, 1):
        if not re.search(r'\.(jpe?g|png)$', p['title'], re.I):
            continue
        ii = p['imageinfo'][0]
        m = ii.get('extmetadata', {})
        lic = m.get('LicenseShortName', {}).get('value', '?')
        art = re.sub('<[^>]+>', '', m.get('Artist', {}).get('value', '')).strip().split('\n')[0][:40]
        fid = f'{pre}{n:02d}'
        with open(os.path.join(out, fid + '.jpg'), 'wb') as f:
            f.write(get(ii['thumburl']))
        time.sleep(0.4)
        print(f"{fid} | {p['title'][5:]} | {ii['width']}x{ii['height']} | {lic} | {art}")


if __name__ == '__main__':
    main()
