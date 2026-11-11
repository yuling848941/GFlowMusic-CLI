// Help text for the flowmusic CLI.
export const HELP = `flowmusic - drive flowmusic.app from the terminal

CREATE
  gen <sound-prompt> [--preset NAME] [--expand] [--lyrics TEXT|@file] [--instrumental] [--title T]
                     [--bpm N] [--length SEC] [--loop SEC] [--auto-peak] [--crossfade 1.5] [--demo N]
                     [--stems] [--model "Lyria 3 Pro"] [--seed N] [--image-id ID]
  presets [category]                       list 24 professional music presets across 9 categories
  expand <prompt> [--preset NAME]          preview 6-Component Sonic Formula prompt expansion (0 credits)
  batch <file> [--jobs 2] [--resume]       many songs; --resume skips already completed ledger items
  chat <message> [-c CONV|last]            talk to the Producer agent (it may make songs)
  wizard                                   guided song creation
  lyrics <prompt>                          write lyrics
  lyrics-edit <text|@file> --prompt P      rewrite lyrics with an instruction
  image <prompt> [--aspect 1:1|16:9|9:16]  cover art
  video <prompt> [--aspect 16:9] [--duration 4]   short video clip (Veo)
  upload <audio-file> [--remove-vocals]    upload audio, prints a clip id usable as input

EDIT (take an existing clip id or local WAV; outputs are new clips/files)
  loop <clip|wav> [--length 15] [--start S | --auto-peak] [--crossfade 1.5] [--demo 3]   seamless single-track loop
  extend <clip> [--prompt P] [--seconds 20] [--from SEC]     replace <clip> --region START-END [--prompt P]
  cover <clip> --prompt P [--strength 0.5]                   stems <clip>
  trim <clip|wav> --start S --end E [--local]                convert <clip...> --format mp3|wav|m4a
  speed <clip> --factor 0.85 [--semitones -2]                slow down / speed up / pitch shift
  modify <clip> <instruction>              free-form edit through the Producer agent (experimental)

ANALYZE
  caption <clip> [--prompt P]   describe a track      transcribe <clip>   lyrics from audio

LIBRARY & LOCAL CATALOG
  list [-n 20]  show <clip>  rename <clip> TITLE  privacy <clip> public|unlisted|private
  history [list|search <q>|show <id>|sync] [-n 20]    offline local asset catalog & search
  favorite <clip>  unfavorite <clip>  favorites       delete <clip...>  wait <clip...>
  download <clip...> [--format mp3|wav|m4a] [--wav] [-o DIR] [--zip FILE]
  cleanup --prefix "CLI Test,LEN-" [--yes]            delete clips by title prefix (dry run unless --yes)

PLAYLISTS & PROJECTS
  playlists [list|show ID|create NAME|rename ID NAME|add ID CLIP...|remove ID CLIP...|delete ID]
  projects [list|create TITLE [--description D]|delete ID]

DISCOVER
  search clips|playlists|users <query> [-n 10]        trending [daily|weekly|monthly]     featured

SESSIONS
  chats [list|rm ID|clean [--yes]]   conversations; "clean" removes empty ones (dry run unless --yes)

ACCOUNT / MCP / TOOLS
  login [--profile|--from-chrome]  logout  whoami  credits  models  doctor  completion bash|zsh
  mcp [--no-spend]                         start built-in Model Context Protocol (MCP) stdio server
  tool <tool_name> '<json args>'           raw producer tool call (advanced)

COMMON FLAGS
  -o, --out DIR   download dir (default ./out)   --no-download  don't fetch audio   --wav  lossless wav
  --json          machine-readable output        -v  raw stream events              --new-session  fresh shared conversation
  --version

AUTH is automatic: the saved session is refreshed silently; with none, a login window opens.
FLOWMUSIC_TOKEN=<access_token> overrides everything.`;
