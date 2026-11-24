# Demo script (about 2 minutes 40 seconds)

Status: draft rewritten 2026-11-24 after a first voice take of 1:28. The narration is read by a generated voice (Google AI Studio) or by the author, and laid over a screen recording made without sound. Counts in the narration (17 specs, 5 hooks, 7 steering files, 2 agents, 21 questions, 7 areas) were counted from the repository on 2026-11-21 and 2026-11-24; recount before recording. The judges see only the first 3 minutes, so the voice must end before 2:50.

## Before recording
- Open a private window (Ctrl+Shift+N), one tab, only the site. No other tab, no extension icon on screen.
- Maximize the window and press Ctrl+0. The shopkeeper window must sit beside the page. If it is below, press Ctrl+minus once.
- Language: English (the EN/JA button at the bottom right).
- Have one sentence ready to paste into "Get ideas": `The build fails with a missing module error. I asked the AI to reinstall it three times and got the same result.`
- Rate limits are loose (reader 30, ideas 10, ghost 60 per minute), so no need to wait between steps.

## Scenes

| Time | You do | Narration |
|---|---|---|
| 0:00 | Show the entrance. Do not click. | Hi. I'm a student in Japan, and this is atamagazon. Quick story. On the day I built this, my own coding agent sent the same long command four times in a row. Each time it was interrupted, and each time it called it bad luck. That is an antlion pit: the sand trap where every struggle makes the slope slide. And honestly, I have been in that pit with AI more often than I would like to admit. |
| 0:23 | Press "Test my skill". Press Start. Answer two questions. After each, pause on the reason and the source. Press "Stop here". | So the first thing the site does is ask what you actually know. There is no login and no score. Each question has an answer, and after each one you get the reason and a source, so even a miss teaches you something. The areas are Docker, MCP, Git, HTTP, spotting an AI's mistake, reading code, and reading tests. I answer two here. There are twenty-one in all, and every code answer was run to check the answer key. |
| 0:48 | Go back to THE PIT. Press "Add a try that did not work" three times. Pause on the verdict and the two numbers. | Now the main part. Say you asked the AI for the same fix three times, and it failed three times. I press the button three times. And here is the verdict. It says No to the approach, never to you. Below it are two numbers: the chance that one more try of the same approach works, and the chance that a fresh start works. I set both by hand, and the page says so. I would rather show honest numbers than fake precision. |
| 1:14 | Press "Shake it". Then pick one example under the shopkeeper. Pick a second one. | If you are stuck, the next move cannot be more of the same. So there is a shake: three provocations that have nothing to do with your problem. And this ghost shopkeeper answers whatever you say with one odd line. Yes, it is weird. A language model gets four random words, a place, a spot, a food and a thing, and has to make one sentence. It is a jolt, not advice. If a line breaks the rules, the ghost stays silent. |
| 1:40 | Press "Get ideas". Paste the prepared sentence. Press "Get five". (Cut the waiting in the edit.) | For real ideas, I paste what is stuck. A bigger model writes five ideas of different kinds, each with a ten-minute test. While it thinks, a word on the rules: it cannot say it ran anything, it cannot make up numbers, and if the answer breaks the shape, the site throws it away. The numbers always come from plain code, never from the model. |
| 2:02 | Switch to the repository on screen: the `.kiro` folder, then `docs/incidents.md`. | Behind the scenes, Kiro built all of this: seventeen specs, five hooks, seven steering files, two custom agents, and an MCP tool called pit check that my own coding agent has to call after two failed tries. My favorite part: every rule in the agent's conduct file names the incident that caused it. The agent really made those mistakes. |
| 2:20 | Back to the site, ABOUT tab or the entrance. | One last thing, honestly. No real user has tried this yet, so I cannot tell you it works for you. The two numbers are set by hand. And the part that reads your sentences is weak: it spots a new approach in only three or four of ten sentences, so you can fix its marks on screen. Thanks for watching. |

## Notes
- The narration is about 480 words. The first voice take ran 268 words in 1:28, so this should run about 2:35. Measure the real length after the voice is made.
- The CHECK questions come in a fixed order (Docker first), and the person cannot pick an area. Two questions then "Stop here" shows the result for Docker only.
- The ghost's line changes every time. Do not write the narration around a particular line.
- Voice: if the voice is generated, say so in the video description. Whether a generated voice may be used in the video is not verified; read the voice service's terms and the Devpost rules.
- If a voice reads "pit_check" badly, the script already says "pit check". If it reads "antlion" badly, write "ant-lion".
- Not verified: how the numbers on the verdict look after three tries. Read them off the screen while recording; do not say them in the narration.
