# Nod Decoy Army - Complete Implementation Guide

## Overview
This ability creates holographic projections (decoys) of selected friendly units. The decoys:
- Can be controlled like normal units
- Reveal fog of war
- Deal NO damage
- Vaporize instantly when attacked
- Auto-vaporize after 60 seconds

## Implementation Pattern
Based on the **Allied Chronosphere** ability from red-data mod, using a **two-stage targeting system**:
1. **First Click**: Select SOURCE location (where to clone units from)
2. **Second Click**: Select DESTINATION location (where decoys appear)

---

## Files Created

### 1. `DecoyArmy_Implementation.xml`
Location: `tib-data.SC2Mod\Base.SC2Data\GameData\Nod\`

Contains all XML data definitions:
- **Units**: `NodDecoyUnit`, `NodDecoyArmyMarker`
- **Abilities**: `NodDecoyArmyTargeting`, `NodDecoyArmy_Execute`
- **Effects**: Clone, teleport, and marker creation effects
- **Behaviors**: `NodDecoyBehavior` (hallucination + instant death on hit), `NodDecoyTimedLife` (60s auto-death)
- **Actors & Models**: Visual representation
- **Buttons & Cooldowns**: UI elements

### 2. `NodDecoyArmy_Triggers.galaxy`
Location: `tib-data.SC2Mod\Base.SC2Data\`

Contains Galaxy script triggers:
- **DecoyArmyTargetingSticky**: Handles first click (source selection)
- **DecoyArmyExecute**: Handles second click (creates decoys)
- **DecoyArmyCancel**: Cleanup when ability is cancelled

---

## Integration Steps

### Step 1: Include XML in Catalog
Add to your main catalog file (or create a new include):

```xml
<!-- In tib-data.SC2Mod\Base.SC2Data\GameData\GameData.xml -->
<Catalog>
    <Include path="Nod/DecoyArmy_Implementation.xml"/>
</Catalog>
```

### Step 2: Include Galaxy Script
Add to your library initialization (e.g., `LibNOD.galaxy`):

```c
// In variable declarations section
unitgroup libNOD_gv_decoyMarkerTarget;

// In InitVariables function
void libNOD_InitVariables () {
    // ... existing code ...
    libNOD_gv_decoyMarkerTarget = UnitGroupEmpty();
}

// In InitTriggers function
void libNOD_InitTriggers () {
    // ... existing code ...
    libNOD_gt_DecoyArmyTargetingSticky_Init();
    libNOD_gt_DecoyArmyExecute_Init();
    libNOD_gt_DecoyArmyCancel_Init();
}
```

### Step 3: Add Ability to Unit
Add the ability to the unit that should have it (e.g., Nod Tech Center or Support Power structure):

```xml
<CUnit id="NodTechCenter">
    <!-- ... existing properties ... -->
    <AbilArray Link="NodDecoyArmyTargeting"/>
    
    <CardLayouts index="0">
        <!-- ... existing buttons ... -->
        <LayoutButtons Face="NodDecoyArmyButton" Type="AbilCmd" 
                      AbilCmd="NodDecoyArmyTargeting,Execute" 
                      Row="2" Column="0"/>
    </CardLayouts>
</CUnit>
```

---

## How It Works

### User Experience Flow

1. **Player clicks ability button** on Nod structure
2. **First targeting cursor appears** - player clicks SOURCE location (where units are)
3. **Marker unit spawns** at source (invisible to enemy)
4. **Second targeting cursor appears** - player clicks DESTINATION location
5. **Decoys are created** at destination:
   - All ground units within 3.5 radius of source are cloned
   - Decoy copies appear at destination
   - Decoys have hallucination behavior applied
6. **Marker is removed** after 1 second

### Technical Flow

```
NodDecoyArmyTargeting (Ability)
    ↓ [Player clicks source]
libNOD_gt_DecoyArmyTargetingSticky_Func (Trigger)
    ↓ Creates marker unit
    ↓ Enables second targeting
NodDecoyArmy_Execute (Ability)
    ↓ [Player clicks destination]
libNOD_gt_DecoyArmyExecute_Func (Trigger)
    ↓ Finds units at source
    ↓ Creates decoy copies at destination
    ↓ Applies NodDecoyBehavior
    ↓ Cleans up marker
```

---

## Key Components Explained

### NodDecoyBehavior
```xml
<CBehaviorBuff id="NodDecoyBehavior">
    <Duration value="60"/>  <!-- Lives for 60 seconds -->
    <Modification>
        <StateFlags index="Hallucination" value="1"/>  <!-- Marks as hallucination -->
        <ModifyFlags index="RevealUnit" value="1"/>    <!-- Reveals fog of war -->
    </Modification>
    <DamageResponse ModifyFraction="0">
        <KillUnit value="1"/>  <!-- Dies instantly when hit -->
    </DamageResponse>
</CBehaviorBuff>
```

**Key Features**:
- `Hallucination` flag: Makes unit appear translucent, deals no damage
- `RevealUnit`: Uncovers fog of war
- `DamageResponse` with `KillUnit`: Instant death on any damage

### Two-Stage Targeting
Uses `UISetTargetingOrder` to chain abilities:

```c
UISetTargetingOrder(
    PlayerGroupSingle(lv_player),           // Who can see it
    libNOD_gv_decoyMarkerTarget,            // Unit group to control
    OrderTargetingPoint(                     // What order to issue
        AbilityCommand("NodDecoyArmy_Execute", 0), 
        EventUnitTargetPoint()
    ),
    true                                     // Sticky targeting
);
```

This automatically transitions from first ability to second ability.

---

## Customization Options

### Adjust Clone Radius
In `NodDecoyCloneUnitsInArea`:
```xml
<AreaArray Radius="3.5" Effect="NodDecoyCloneSingleUnit"/>
<!-- Change 3.5 to desired radius -->
```

### Adjust Lifetime
In `NodDecoyTimedLife`:
```xml
<Duration value="60"/>
<!-- Change 60 to desired seconds -->
```

### Adjust Cooldown
In `NodDecoyArmyTargeting`:
```xml
<Cooldown Link="NodDecoyArmyCooldown" TimeStart="120" TimeUse="120"/>
<!-- Change 120 to desired seconds -->
```

### Filter Unit Types
In the Galaxy trigger `libNOD_gt_DecoyArmyExecute_Func`, modify the `UnitFilter`:

```c
UnitFilter(
    0,                                   // Include ground units
    0,                                   // Include all
    (1 << c_targetFilterStructure) |     // Exclude structures
    (1 << c_targetFilterMissile) |       // Exclude missiles
    (1 << c_targetFilterWorker),         // ADD: Exclude workers
    (1 << (c_targetFilterDead - 32))     // Exclude dead units
)
```

---

## Testing Checklist

- [ ] Ability appears on correct unit's command card
- [ ] First click creates marker at source location
- [ ] Second targeting cursor appears after first click
- [ ] Decoys are created at destination matching source units
- [ ] Decoys reveal fog of war
- [ ] Decoys die instantly when attacked
- [ ] Decoys auto-vaporize after 60 seconds
- [ ] Decoys deal no damage
- [ ] Ability goes on cooldown (120s)
- [ ] Canceling ability removes marker units
- [ ] Multiple decoy armies can be active simultaneously

---

## Troubleshooting

### Decoys don't die instantly when hit
- Check that `NodDecoyBehavior` is being applied
- Verify `DamageResponse` has `KillUnit` set to `1`

### Decoys deal damage
- Ensure `StateFlags index="Hallucination"` is set to `1`
- Check that behavior is applied correctly

### Second targeting doesn't appear
- Verify `UISetTargetingOrder` is being called
- Check that marker unit has `NodDecoyArmy_Execute` ability
- Ensure `libNOD_gv_decoyMarkerTarget` unit group is populated

### Units aren't cloned
- Check radius in `NodDecoyCloneUnitsInArea`
- Verify unit filters aren't excluding desired units
- Ensure trigger is firing (add debug text)

### Fog of war not revealed
- Verify `ModifyFlags index="RevealUnit" value="1"` in behavior
- Check unit sight range is > 0

---

## Performance Notes

- Each decoy is a full unit, so creating 20+ decoys may impact performance
- Consider limiting the number of units cloned (add max count in trigger)
- Decoys auto-clean up after 60s to prevent unit bloat

---

## Future Enhancements

1. **Visual Effects**: Add spawn/death effects for decoys
2. **Sound Effects**: Play audio when ability activates
3. **Unit Cap**: Limit maximum decoys per cast
4. **Selective Cloning**: Allow player to select specific units
5. **Formation Preservation**: Maintain unit formation when cloning
6. **Tech Requirement**: Require specific building/upgrade

---

## Credits

Based on the **Allied Chronosphere** implementation from `red-data.sc2mod`.
Pattern adapted for Nod faction decoy mechanics.
