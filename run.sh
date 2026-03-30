#!/usr/bin/env bash
set -e

# Resolve all paths relative to this script, regardless of where it's invoked from
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

MAP="$DIR/map.ascii"
BOOKINGS="$DIR/bookings.json"

# Parse --map and --bookings from arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --map)      MAP="$2";      shift 2 ;;
    --bookings) BOOKINGS="$2"; shift 2 ;;
    *) shift ;;
  esac
done

echo "Building frontend..."
npm run build --prefix "$DIR/client"

echo "Starting server..."
echo "  Map:      $MAP"
echo "  Bookings: $BOOKINGS"
node "$DIR/server/index.js" --map "$MAP" --bookings "$BOOKINGS"
