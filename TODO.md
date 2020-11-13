### Critical
- Put canvas inside react component with state, that will not be replaced on state changes
- Figure out how to dispatch react events from PIXI code
- Figure out how to access redux state in PIXI code
- Add pixi-cull
- Vision fog
- Map knowledge fog
### High
- protobuf API
### Low
- hashed terrain grass
- auto forests

### UI controls
#### Critical
- Play (to the end)
- Step (to the next turn)
- Jump to arbitrary step
- Arrow in the direction of next move
#### High
- Lock camera
- Path line
#### Low
- Rewind
- Grid on/off


### main loop design
#### parameters
- currentTime
    integer part is turn number
    fractional part is in-between animation time
- currentTurnState
    tracks the number of 'base' turn - the starting point of tweening
    if integer part of currentTime is not equal to this, it means that we entered next turn and object states need to be recalculated before tweening further
#### loop
- check currentTurnState <= currentTime < currentTurnState+1
    + if false, recalculate position and state of all objects at turn 'integer(currentTime)'
- calculate tweening positions
- if game is stopped/paused, then go idle