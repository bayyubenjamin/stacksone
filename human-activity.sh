#!/bin/bash

TOTAL=200
COUNT=0

MESSAGES=(
  "refactor: improve structure"
  "docs: enhance explanation"
  "feat: small improvement"
  "fix: minor adjustment"
  "chore: cleanup"
  "docs: improve clarity"
  "feat: tweak behavior"
  "refactor: optimize flow"
)

FILES=(
  "src/utils.js"
  "src/helper.js"
  "docs/notes.md"
  "docs/devlog.md"
  "temp-log.txt"
)

while [ $COUNT -lt $TOTAL ]
do
  # SESSION MODE (kayak orang kerja 5–15 commit)
  SESSION=$(( (RANDOM % 10) + 5 ))

  echo "Session start: $SESSION commits"

  for ((i=1; i<=SESSION && COUNT<TOTAL; i++))
  do
    COUNT=$((COUNT+1))
    echo "Commit $COUNT"

    FILE=${FILES[$RANDOM % ${#FILES[@]}]}
    mkdir -p "$(dirname "$FILE")"

    echo "// update $COUNT at $(date)" >> $FILE

    git add .

    MSG=${MESSAGES[$RANDOM % ${#MESSAGES[@]}]}
    git commit -m "$MSG"

    git push origin main

    # delay antar commit (30 detik – 3 menit)
    SLEEP=$(( (RANDOM % 150) + 30 ))
    sleep $SLEEP
  done

  # BREAK antar session (5 – 20 menit)
  BREAK=$(( (RANDOM % 900) + 300 ))
  echo "Break time: $BREAK sec"
  sleep $BREAK

done

echo "DONE 200 COMMITS"
