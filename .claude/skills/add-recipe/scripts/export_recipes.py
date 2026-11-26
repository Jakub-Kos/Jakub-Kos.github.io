"""List or dump recipe cards from a claude.ai data export, without unpacking it.

    python3 -I export_recipes.py <conversations.zip>                 # list all recipe cards
    python3 -I export_recipes.py <conversations.zip> "gulas" "losos" # dump matching cards + chat

Matching is case- and diacritics-insensitive against the card title. The dump
includes the card (ingredients, steps, notes) and every human message in that
conversation, so follow-up tweaks ("too sour", "use piskefløde") aren't missed.
"""
import json
import sys
import unicodedata
import zipfile


def norm(s):
    return ''.join(c for c in unicodedata.normalize('NFD', (s or '').lower()) if unicodedata.category(c) != 'Mn')


def cards(conv):
    for m in conv.get('chat_messages', []):
        for x in m.get('content') or []:
            if x.get('type') == 'tool_use' and 'recipe' in (x.get('name') or ''):
                yield x.get('input', {})


def main():
    path, *wanted = sys.argv[1:]
    with zipfile.ZipFile(path) as z:
        name = next(n for n in z.namelist() if n.endswith('conversations.json'))
        data = json.loads(z.read(name))
    data.sort(key=lambda c: c.get('created_at', ''))
    for conv in data:
        date = conv.get('created_at', '')[:10]
        for card in cards(conv):
            title = card.get('title', '')
            if not wanted:
                print(f"{date} | {conv.get('name')} | {title}")
                continue
            if not any(norm(w) in norm(title) for w in wanted):
                continue
            print('#' * 10, date, conv.get('name'), '::', title)
            print('servings', card.get('base_servings'), '|', card.get('description'))
            for i in card.get('ingredients', []):
                print('  ING', i.get('amount', ''), i.get('unit', ''), i.get('name'))
            for s in card.get('steps', []):
                print('  STEP', s.get('title'), ':', s.get('content'), f"[timer {s.get('timer_seconds')}]")
            print('  NOTES', card.get('notes'))
            print('  -- human messages in this chat:')
            for m in conv.get('chat_messages', []):
                if m.get('sender') == 'human':
                    t = ' '.join(x.get('text', '') for x in (m.get('content') or []) if x.get('type') == 'text').strip()
                    if t:
                        print('   >', t[:400].replace('\n', ' '))


if __name__ == '__main__':
    main()
