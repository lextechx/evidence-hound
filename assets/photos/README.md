# Photos

Drop image files here, then add an entry to `content/photos.json`:

```json
{ "file": "koda-cast.jpg", "alt": "Koda in the car after TPLO surgery, green cast on his hind leg, grinning", "caption": "After the second TPLO." }
```

The build copies this folder to `dist/photos/` and the story page renders them.

Keep files reasonably sized. Firebase Hosting's free tier allows 10 GB stored and 360 MB
transferred per day, and a page of unoptimized phone photos will burn through the transfer
budget far faster than the whole rest of the site. Around 1600px on the long edge is plenty.
