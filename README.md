MyTube
=====

The goal is to create a website with all the videos that we could be interested in viewing, in a better format than what is proposed by Youtube. 
The first step is just to see if it is possible to retrieve the required information from youtube by making api requests. So that's what I am doing at first. Messing around with the youtube API, and check what can be done with it.

Okay, so I can list the videos on a channel. Now what do I need?
A database to store:
    - channels I am subscribed to
    - playlists I am subscribed to
    - all videos retrieved from youtube with: 
        - title, description, thumbnail, postDate, url, viewed/notViewed, associated subscription.
A script that every day lists all the suff I am subscribed to, and retrieve the list of recent videos
Add videos to this list when they are not already present in the database
Create a webpage that show the list of all the videos I could be interested in.

Okay, before this project dies of feature creep, let me define the MVP (minimum viable product) to guide the future developments: 
    X I can add channels from their id
    X I can see a list of all the videos from the channel that I haven't seen yet.
    X Clicking on one of the videos opens the youtube page for the video, and marks the video as 'seen', removing it from the list.
    X Automatically fetch the new videos for the channels I am subscribed to

I have the MVP I think. Now to add some features which would be nice: 
    X Sorting the visible video by upload date (easy)
    X Fetch all the videos from a channel (and not just the most recent)
    X Create an initial DB with all our common subscriptions
    X Search bar that searches in channels and titles
    X Being able to see all the videos from a specific channel (including those already seen)
    X Being able to easily mark as seen/unseen the videos from a channel
    X Have a style for videos which have already been seen
    X Display the duration of each video
    X Remove shorts
    X Nicer buttons
    X Implement a preference system to move up videos from channels we look at more frequently
    - Support for playlists
    - Make links for moving between the different pages instead of modifying the DOM directly.
    - Filter short/long videos 
    - Display the icon of the channel above each video
    - Deal with duplicates
    X Make it easy to deploy
    - Button to indicate that you are not interested by a video
    - Button to show already viewed videos (not sure that is necessary)
    - Ability to have several separate lists (not for this version)