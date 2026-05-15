0. Tests. Ignore for now.
~~1. Director dashboard "Recent Activity" section should show the latest news story and pronouncements from the current Day.~~
~~2. Polling should also work for the character page, I should be able to see the status of my pending messages and incoming messages without refreshing.~~
~~3. Add a button for Backroomer/Character Dashboards to return to All Scenarios page, similar to the one on Director Dashboard.~~
~~4. When a director returns to All Scenarios page, the scenario he created should show on My Engagements tab.~~
~~5. When a director returns to All Scenarios page, the director should be able to return to the director dashboard of the scenario he created. Current directs to lobby.~~
~~6. Backroomer should not be able to post news storys to a completed scenario. This is not intended.~~
~~7. When viewing a Completed scenario from /scenarios, it should show /news page, not the lobby or dashboards. But for players engaged in this scenario, it should still show the dashboards.~~

~~8. "Recent Activity" on Director Dashboard should follow the design style in "News Feed" on Backroomer and Character Dashboards.~~
~~9. Delete Scenario as a Director returns error: (500: could not execute statement [Referential integrity constraint violation: "FKPAM9EGWMHBGTSAIYSOYGE4LEQ: PUBLIC.MESSAGE FOREIGN KEY(CREATOR_ID) REFERENCES PUBLIC.CHARACTERS(ID) (CAST(2 AS BIGINT))"; SQL statement: delete from characters where id=? [23503-240]] [delete from characters where id=?]; SQL [delete from characters where id=?]; constraint [FKPAM9EGWMHBGTSAIYSOYGE4LEQ])~~
~~10. Deleting Scenario must validate the Director role and token of that scenario.~~
~~11. Scenario cards on /scenarios should show a label indicating progress status. Status are Preparing (corresponding to scenario status UNSTARTED), In Progress (corresponding to FROZEN OR UNFROZEN), and Completed (COMPLETED).~~
~~12. Change the name of the "My Engagements" tab to "My Scenarios".~~
~~13. Remove the bell icon on the top right on Character Dashboard.~~
~~14. On Character Dashboard, if you receive (or have unread) messages from another character, it should be indicated (by an unread dot or status label next to the corresponding character avatar or name).~~
15. Ignore this for now. Edge cases: what happens if there are too many news feeds, directives, or messages on Backroom and Character Dashboard? Scrollable or should limit shown messages with a "View More..." button?
~~16. Polling should work for /scenarios to automatically load new scenarios created.~~
~~17. Portrait preview on scenario creation shows a broken picture icon. Also on character list.~~
~~18. In lobby, on character card, "Click to Select" and the line needs to be move downwards to the bottom of the card.~~
~~19. In most pages, the avatar icon on the very top right should pop up a window on click. The pop up window should show the User's Profile Pic, Username, Name (empty by default), and Bio. It should also allow User to change Profile Pic, Name, and Bio. Changes should persist both client and server side.~~
~~19. On Character Dashboard, the top right avatar should be the profile pic of the user, not the character.~~
~~20. On Director Dashboard, move the text "Recent Activity" and See All News button out from the card. Follow the style on the News Feed section on Backroomer and Character Dashboard.~~
~~21. On the profile pic pop up window, Username, Name, and Bio should be centered to the middle. Remove the Edit button. Name, Bio, Profile pic should be editable on click, and indicates on hover.~~
~~22. Profile pics icon should appear on the top right for all pages where there is already a circle placeholder for avatar, and they should all have the same function as the one on /scenarios.~~
~~23. Move the All Scenario button on all dashboards to the top right, next to the avatar.~~
~~24. Refine Character List on Character Dashboard. Remove View button. Make the avatar and character names clickable. ~~
~~25. Change the unread red dot to a badge that indicates unread messages and move it to the right.~~
~~26. Change icon placeholders on the top left of each page to favicon.ico or favicon.png.~~
~~27. Unify the size and font size of the top navbar of all pages to align with /scenarios.~~
28. In communication form, if comm type is direct message, title should be greyed out, since character profile page is not showing message title anyways. 
29. Lobby should show detailed description of scenario, character cards should show detailed description on hover or pop up.
30. Scenario title should show on the navbar for Backroom and Player Dashboards.
31. Scenario details should show somehow for Backroom and Player Dashboards (hover, pop up, or separate page on clicking Title).
32. Character died message should be displayed somewhere else than the navbar.
33. Ignore this for now. Edge cases: wherever there's a large text body, display of it should be truncated, and full text should be easily viewed somehow by clicking "show more" or something like that. Possible usecases: scenario descriptions, messages (limited input), new stories (limited input), directives and responses (limited input).