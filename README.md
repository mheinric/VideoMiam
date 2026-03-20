# VideoMiam

VideoMiam is a simple website showing you videos from the youtube channels you follow.
You can think of it as the 'Subscription' page on youtube, except that:

- there is no short
- the videos are sorted by date
- the videos you've already seen are filtered out
- you can specify some channels as 'preferred' to show their videos before the others
- you can subscribe to individual playlists instead of a whole channel
- you can view all the videos from a given channel, with an indication of which videos you've alreay seen and which you haven't

This project stems from the author's frustration with Youtube's interface and his inability (or unwillingness) to remember which videos he had already already watched.
You can use the website for free by creating an account [here](https://videomiam.fr), or follow the instructions below if you want to host it yourself.

## Screenshot

![screenshot](./public/img/screenshot.svg?raw=true "Screenshot")

## Technical remarks

- New videos are fetched from Youtube (using the Youtube Data API) once a day, so you might observe a bit of delay between the moment the video is published on youtube, and the moment the video appears on the website.

## Installation

Follow these instructions if you want to self-host VideoMiam.

You need to have [NodeJs](https://nodejs.org) installed on your machine (tested with node 18.20).
You will need an API key for the [Youtube Data API](https://developers.google.com/youtube/v3/getting-started).
Then, clone the repository: 
```bash
git clone https://github.com/mheinric/VideoMiam.git
cd VideoMiam
```

Create a `config.yaml` file, you can use the template file as a basis:
```bash
cp config-template.yaml config.yaml
```
Edit this config file, you will need at least to put your Google API key there, check out the other settings depending on your use case.

Install the necessary dependencies:
```bash
npm install
```

Finally, the website can be run with:
```bash
node main.js
```

## Contributing

Feel free to open an issue for suggestions, questions, or any other remarks.

## License

This project is released under the MIT license.