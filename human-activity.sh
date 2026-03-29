#!/bin/bash

TOTAL=100

MESSAGES=(
  "refactor: improve logic structure"
  "docs: update explanation"
  "feat: add small improvement"
  "fix: minor adjustment"
  "chore: cleanup file"
  "docs: enhance readability"
  "feat: tweak behavior"
)

FILES=(
  "src/utils.js"
  "docs/notes.md"
  "temp-log.txt"
  "src/helper.js"
)

for ((i=1; i<=TOTAL; i++))
do
  echo "Commit $i"

  # pilih file random
  FILE=${FILES[$RANDOM % ${#FILES[@]}]}

  # pastikan folder ada
  mkdir -p "$(dirname "$FILE")"

  # update isi file
  echo "// update $i at $(date)" >> $FILE

  git add .

  # commit message random
  MSG=${MESSAGES[$RANDOM % ${#MESSAGES[@]}]}

  git commit -m "$MSG"

  git push origin main

  # delay random 1 - 10 menit
  SLEEP=$(( (RANDOM % 600) + 60 ))
  echo "sleep $SLEEP sec"
  sleep $SLEEP

done
