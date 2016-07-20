#!/usr/bin/env python
from sys import argv

string = argv[1]
pairs = string.split("&")
unames = pairs[1].split("=")
uname = unames[1]
scores = pairs[0].split("=")
score = scores[1]

toParse = list(uname)
for i in toParse:
    if i == "+":
        toParse[toParse.index(i)] = " "
uname = "".join(toParse)

scorefile = open("highscores.txt", "a+")
lines = (scorefile.readlines())
for i in lines:
    pair = i.split(":")
    if pair[1] == (uname + "\n"):
        del lines[lines.index(i)]
lines.append(score + ":" + uname + "\n")
lines.sort(key=lambda x: int(x.split(":")[0]), reverse=True)
scorefile.close()

open("highscores.txt", "w").close()

scorefile = open("highscores.txt", "w")
for i in lines:
    if lines.index(i) < 10:
        scorefile.write(i)
scorefile.close()
