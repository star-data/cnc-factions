# 🧭 **Гайд: Как использовать Unit Trackers в StarCraft 2**

Этот пример показывает, как **создать систему связи между юнитами** — где есть **Хост (Host)** и **Миньоны (Minions)**.
Миньоны могут **присоединяться, отсоединяться, атаковать по приказу хоста и возвращаться обратно**.
Всё это реализуется с помощью **Unit Trackers**, **Behavior’ов**, **Effect’ов** и **Ability’ей**.


```xml



    <!--Minion: Tracks Linked Host for Minion-->
    <CBehaviorUnitTracker id="CombineHostTracker">
        <InfoFlags index="Hidden" value="1"/>
        <InfoIcon value="Assets\icons\\btn--unit-seeker.dds"/>
    </CBehaviorUnitTracker>
    <CEffectAddTrackedUnit id="CombineHostTracker@ATU">
        <BehaviorLink value="CombineHostTracker"/>
        <TrackerUnit Value="Caster"/>
        <TrackedUnit Value="Target"/>
    </CEffectAddTrackedUnit>
    <CEffectRemoveTrackedUnit id="CombineHostTracker@RTU">
        <BehaviorLink value="CombineHostTracker"/>
        <TrackedUnit Value="Target"/>
    </CEffectRemoveTrackedUnit>

    <!--Host: Tracks Linked Minion for Host -->
    <CBehaviorUnitTracker id="CombineMinionTracker">
        <InfoIcon value="Assets\icons\\btn--unit-Minion.dds"/>
        <InfoFlags index="Hidden" value="1"/>
    </CBehaviorUnitTracker>
    <CEffectAddTrackedUnit id="CombineMinionTracker@ATU">
        <BehaviorLink value="CombineMinionTracker"/>
        <TrackerUnit Value="Target"/>
    </CEffectAddTrackedUnit>
    <CEffectRemoveTrackedUnit id="CombineMinionTracker@RTU">
        <BehaviorLink value="CombineMinionTracker"/>
        <TrackerUnit Value="Target"/>
    </CEffectRemoveTrackedUnit>
    
    <!--Minion: Indicates that Minion are linked with Host and currently in attack order. -->
    <CBehaviorBuff id="MinionLinked">
        <InfoIcon value="Assets\icons\\btn--unit-seeker.dds"/>
        <Period value="0.0625"/>
        <PeriodicEffect value="MinionLinked@ETU"/>
    </CBehaviorBuff>
    <!-- Periodically try to return to linked Host if Minion has no orders-->
    <CEffectEnumTrackedUnits id="MinionLinked@ETU">
        <ValidatorArray value="CasterHasNoOrders"/>
        <BehaviorLink value="CombineHostTracker"/>
        <Effect value="MinionLinked@IO"/>
    </CEffectEnumTrackedUnits>
    <CEffectIssueOrder id="MinionLinked@IO">
        <Abil value="move"/>
        <WhichUnit Value="Caster"/>
        <Target Effect="MinionLinked@IO" Value="TargetUnit"/>
    </CEffectIssueOrder>
    <CValidatorUnitCompareBehaviorCount id="IsMinionLinked">
        <WhichUnit Value="Caster"/>
        <Behavior value="MinionLinked"/>
        <Compare value="NE"/>
    </CValidatorUnitCompareBehaviorCount>
    <CEffectRemoveBehavior id="MinionLinked@RB">
        <WhichUnit Value="Caster"/>
        <BehaviorLink value="MinionLinked"/>
    </CEffectRemoveBehavior>

    <!--Minion: Indicates that Minion are linked with Host and Hosted with it. Hosted Minion only follow linked Host. -->
    <CBehaviorBuff id="MinionFused">
        <InfoIcon value="Assets\icons\\btn--unit-seeker.dds"/>
        <InfoFlags index="Hidden" value="1"/>
        <Modification>
            <ModifyFlags index="DisableAbils" value="1"/>
            <ModifyFlags index="SuppressMoving" value="1"/>
            <StateFlags index="NoDraw" value="1"/>
            <StateFlags index="Invulnerable" value="1"/>
            <StateFlags index="Uncommandable" value="1"/>
            <StateFlags index="Unselectable" value="1"/>
            <StateFlags index="Untargetable" value="1"/>
        </Modification>
    </CBehaviorBuff>
    <CValidatorUnitCompareBehaviorCount id="IsMinionFused">
        <WhichUnit Value="Caster"/>
        <Behavior value="MinionFused"/>
        <Compare value="NE"/>
    </CValidatorUnitCompareBehaviorCount>
    <CEffectRemoveBehavior id="MinionFused@RB">
        <WhichUnit Value="Caster"/>
        <BehaviorLink value="MinionFused"/>
    </CEffectRemoveBehavior>
    <CEffectApplyBehavior id="MinionFused@AB">
        <WhichUnit Value="Target"/>
        <Behavior value="MinionFused"/>
    </CEffectApplyBehavior>
    <CEffectApplyBehavior id="MinionFused@ABCaster">
        <WhichUnit Value="Caster"/>
        <Behavior value="MinionFused"/>
    </CEffectApplyBehavior>

    <!--Host: Indicates that Host has linked Minion-->
    <CBehaviorBuff id="HostCombined">
        <InitialEffect value="HostCombined@IE"/>
        <InfoIcon value="Assets\icons\\btn--unit-Minion.dds"/>
        <MaxStackCount value="0"/>
        <RemoveValidatorArray value="IsMinionCombined"/>
        <RefreshEffect value="HostCombined@IE"/>
        <FinalEffect value="HostCombined@FE"/>
    </CBehaviorBuff>
    <CEffectSet id="HostCombined@IE">
        <EffectArray value="HostCombined@TP"/>
        <EffectArray value="HostCombined@AK"/>
        <EffectArray value="Combine@DeselectMinion"/>
        <EffectArray value="HostFused@AB"/>
    </CEffectSet>
    <CEffectCreatePersistent id="HostCombined@FE">
        <WhichLocation Value="TargetUnit"/>
        <PeriodCount value="8"/>
        <PeriodicEffectArray value="HostCombined@RK"/>
        <PeriodicEffectArray value="MinionFused@RB"/>
        <PeriodicEffectArray value="MinionLinked@RB"/>
        <PeriodicEffectArray value="HostFused@RB"/>
        <PeriodicEffectArray value="HostLinked@RB"/>
        <PeriodicEffectArray value="CombineHostTracker@RTU"/>
        <PeriodicEffectArray value="CombineMinionTracker@RTU"/>
        <PeriodicEffectArray value="FuseUnfuseCargoSuicide"/>
        <FinalEffect value="Combine@SetCooldown"/>
        <ExpireDelay value="0.5"/>
    </CEffectCreatePersistent>
    <!--Kill Minion if host was killed inside transport-->
    <CEffectDamage id="FuseUnfuseCargoSuicide">
        <ValidatorArray value="IsHidden"/>
        <ImpactLocation Value="CasterUnit"/>
        <Flags index="Kill" value="1"/>
    </CEffectDamage>
    <!--Follow Host Using Kinetics (Optional)-->
    <CEffectApplyKinetic id="HostCombined@AK">
        <ImpactUnit Value="Caster"/>
        <Kinetic value="FollowTargetPosition"/>
    </CEffectApplyKinetic>
    <CEffectRemoveKinetic id="HostCombined@RK">
        <KineticLink value="FollowTargetPosition"/>
        <ImpactUnit Value="Caster"/>
    </CEffectRemoveKinetic>
    <!--Follow Host Using Teleport (Optional)-->
    <CEffectTeleport id="HostCombined@TP">
        <WhichUnit Value="Caster"/>
        <MinDistance value="0"/>
        <TargetLocation Value="TargetUnit"/>
        <TeleportFlags index="TestFog" value="0"/>
    </CEffectTeleport>

    <!--check if unit still linked-->
    <CValidatorCombine id="IsMinionCombined">
        <Type value="Or"/>
        <CombineArray value="IsMinionFused"/>
        <CombineArray value="IsMinionLinked"/>
    </CValidatorCombine>
    <CEffectApplyBehavior id="HostCombined@AB">
        <Behavior value="HostCombined"/>
    </CEffectApplyBehavior>
    <CEffectRemoveBehavior id="HostCombined@RB">
        <BehaviorLink value="HostCombined"/>
        <Count value="1"/>
    </CEffectRemoveBehavior>

    <!--Host: Indicates that Host has linked Minion which are currently Fused with the Host-->
    <CBehaviorBuff id="HostFused">
        <InfoIcon value="Assets\icons\\btn--unit-Minion.dds"/>
        <InfoFlags index="Hidden" value="1"/>
        <MaxStackCount value="0"/>
    </CBehaviorBuff>
    <!--Model attachment. Original unit model will be hidden while hosted-->
    <CActorSiteOpLocalOffset id="HostFused@SOpLO">
        <LocalOffset value="0.000000,0.000000,-0.5"/>
    </CActorSiteOpLocalOffset>
    <CActorModel id="HostFused@MA" parent="ModelAddition">
        <Inherits index="BaseModelScale" value="0"/>
        <Inherits index="Scale" value="0"/>
        <Inherits index="TintColor" value="0"/>
        <On Terms="Behavior.HostFused.On" Send="Create"/>
        <On Terms="Behavior.HostFused.Off" Send="AnimBracketStop BSD"/>
        <HostSiteOps Ops="SOpAttachCenter HostFused@SOpLO"/>
        <AutoScaleFactor value="1"/>
        <Model value="Minion"/>
    </CActorModel>
    <CEffectRemoveBehavior id="HostFused@RB">
        <BehaviorLink value="HostFused"/>
        <Count value="1"/>
    </CEffectRemoveBehavior>
    <CEffectApplyBehavior id="HostFused@AB">
        <WhichUnit Value="Target"/>
        <Behavior value="HostFused"/>
    </CEffectApplyBehavior>
    <CEffectRemoveBehavior id="HostFused@RBCaster">
        <WhichUnit Value="Caster"/>
        <BehaviorLink value="HostFused"/>
        <Count value="1"/>
    </CEffectRemoveBehavior>

    <!--Host: Indicates that Host has linked Minion which are currently in attacking order -->
    <CBehaviorBuff id="HostLinked">
        <InfoFlags index="Hidden" value="1"/>
        <InfoIcon value="Assets\icons\\btn--unit-Minion.dds"/>
        <MaxStackCount value="0"/>
    </CBehaviorBuff>
    <CEffectRemoveBehavior id="HostLinked@RB">
        <BehaviorLink value="HostLinked"/>
        <Count value="1"/>
    </CEffectRemoveBehavior>
    <CEffectApplyBehavior id="HostLinked@ABCaster">
        <WhichUnit Value="Caster"/>
        <Behavior value="HostLinked"/>
    </CEffectApplyBehavior>

    <!--Minion: Fuse Minion with Host-->
    <CAbilEffectTarget id="Combine">
        <Range value="1"/>
        <CmdButtonArray index="Execute" DefaultButtonFace="Combine" Requirements="NBU_MinionLinked"/>
        <Flags index="AllowMovement" value="1"/>
        <Flags index="NoDeceleration" value="1"/>
        <Cost>
            <Cooldown TimeUse="5"/>
        </Cost>
        <TargetFilters value="-;Self,Ally,Neutral,Enemy,Structure,Missile,Stasis,Dead,Hidden"/>
        <AINotifyEffect value="HostCombined@AB"/>
        <Arc value="360"/>
    </CAbilEffectTarget>
    <CEffectSet id="Combine">
        <TargetLocationType value="Unit"/>
        <ValidatorArray value="Combine@HasUncombine"/>
        <ValidatorArray value="Combine@CombineLimit"/>
        <EffectArray value="MinionFused@ABCaster"/>
        <EffectArray value="HostCombined@AB"/>
        <EffectArray value="Combine@DeselectMinion"/>
        <EffectArray value="CombineHostTracker@ATU"/>
        <EffectArray value="CombineMinionTracker@ATU"/>
    </CEffectSet>
    <!--Validate that target unit can combine with Minion-->
    <CValidatorUnitAbil id="Combine@HasUncombine">
        <ResultFailed value="Error,ErrorText/Combine@WrongTarget"/>
        <Find value="1"/>
        <AbilLink value="HostUncombine"/>
    </CValidatorUnitAbil>
    <!--Set Limits For Linked Minion -->
    <CValidatorUnitCompareBehaviorCount id="Combine@CombineLimit">
        <ResultFailed value="Error,ErrorText/Combine@CombineLimit"/>
        <WhichUnit Value="Target"/>
        <Behavior value="HostCombined"/>
        <Compare value="LT"/>
        <Value value="1"/>
    </CValidatorUnitCompareBehaviorCount>
    <CEffectModifyUnit id="Combine@SetCooldown">
        <ImpactUnit Value="Caster"/>
        <Cost Abil="Combine,Execute" CooldownOperation="Set" CooldownTimeUse="5"/>
        <SelectTransferUnit Value="Target"/>
    </CEffectModifyUnit>
    <CEffectModifyUnit id="Combine@DeselectMinion">
        <SelectTransferUnit Value="Caster"/>
        <SelectTransferFlags index="DeselectSource" value="1"/>
    </CEffectModifyUnit>

    <!--Minion: Unfuse Minion from the Host-->
    <CAbilEffectInstant id="MinionUncombine">
        <Flags index="Transient" value="1"/>
        <CmdButtonArray index="Execute" DefaultButtonFace="MinionUncombine" Requirements="CBU_MinionLinked">
            <Flags index="ToSelection" value="1"/>
        </CmdButtonArray>
        <TargetFilters value="-;Ally,Neutral,Enemy,Structure,Stasis,Dead,Hidden"/>
        <AINotifyEffect value="MinionLinked@RB"/>
    </CAbilEffectInstant>
    <CEffectSet id="MinionUncombine">
        <EffectArray value="MinionLinked@RB"/>
    </CEffectSet>

    <!--Host: Unfuse Minion from the Host-->
    <CAbilEffectInstant id="HostUncombine">
        <Flags index="Transient" value="1"/>
        <CmdButtonArray index="Execute" DefaultButtonFace="HostUncombine" Requirements="CBU_HostCombined">
            <Flags index="ToSelection" value="1"/>
        </CmdButtonArray>
        <TargetFilters value="-;Ally,Neutral,Enemy,Structure,Stasis,Dead,Hidden"/>
        <AINotifyEffect value="HostCombined@RB"/>
    </CAbilEffectInstant>
    <CEffectSet id="HostUncombine">
        <EffectArray value="HostCombined@RB"/>
    </CEffectSet>

    <!---Host: Set Linked Minion into Attack Order-->
    <CAbilEffectTarget id="SendMinions">
        <Range value="15"/>
        <CmdButtonArray index="Execute" DefaultButtonFace="Minion" Requirements="CBU_HostCombined"/>
        <Flags index="AllowMovement" value="1"/>
        <Flags index="NoDeceleration" value="1"/>
        <TargetFilters value="Ground,Visible;Missile,Stasis,Dead,Hidden,Invulnerable"/>
        <Arc value="360"/>
        <Flags index="AutoCast" value="1"/>
        <Flags index="AutoCastOn" value="1"/>
        <AutoCastFilters value="Ground,Light,Visible;Player,Ally,Neutral,Missile,Stasis,Dead,Hidden,Invulnerable"/>
        <AutoCastRange value="8"/>
        <AutoCastValidatorArray value="HasIdleMinion"/>
    </CAbilEffectTarget>
    <CValidatorCompareTrackedUnitsCount id="HasIdleMinion">
        <Compare value="NE"/>
        <BehaviorLink value="CombineMinionTracker"/>
        <TrackedUnitValidatorArray value="TargetIsNotMovingOrAttacking"/>
    </CValidatorCompareTrackedUnitsCount>
    <CEffectSet id="SendMinions">
        <EffectArray value="SendMinions@ETU"/>
        <TargetLocationType value="UnitOrPoint"/>
    </CEffectSet>
    <CEffectEnumTrackedUnits id="SendMinions@ETU">
        <BehaviorLink value="CombineMinionTracker"/>
        <Effect value="SendMinions@Switch"/>
    </CEffectEnumTrackedUnits>
    <CEffectSwitch id="SendMinions@Switch">
        <CaseArray Validator="SendMinions@IsMinionLinked" Effect="SendMinions@SetLinked"/>
        <CaseDefault value="SendMinions@SetFused"/>
    </CEffectSwitch>
    <CValidatorUnitCompareBehaviorCount id="SendMinions@IsMinionLinked">
        <WhichUnit Effect="SendMinions@Set"/>
        <Behavior value="MinionLinked"/>
        <Compare value="NE"/>
    </CValidatorUnitCompareBehaviorCount>
    <CEffectSet id="SendMinions@SetFused">
        <TargetLocationType value="UnitOrPoint"/>
        <EffectArray value="HostLinked@ABCaster"/>
        <EffectArray value="HostFused@RBCaster"/>
        <EffectArray value="SendMinionsRK"/>
        <EffectArray value="SendMinionsRB"/>
        <EffectArray value="SendMinionsAB"/>
        <EffectArray value="SendMinionsIO"/>
    </CEffectSet>
    <CEffectSet id="SendMinions@SetLinked">
        <TargetLocationType value="UnitOrPoint"/>
        <EffectArray value="SendMinionsIO"/>
    </CEffectSet>
    <CEffectRemoveKinetic id="SendMinionsRK">
        <KineticLink value="FollowTargetPosition"/>
        <ImpactUnit Effect="SendMinions@Set"/>
    </CEffectRemoveKinetic>
    <CEffectRemoveBehavior id="SendMinionsRB">
        <WhichUnit Effect="SendMinions@Set"/>
        <BehaviorLink value="MinionFused"/>
    </CEffectRemoveBehavior>
    <CEffectApplyBehavior id="SendMinionsAB">
        <WhichUnit Effect="SendMinions@Set"/>
        <Behavior value="MinionLinked"/>
    </CEffectApplyBehavior>
    <CEffectIssueOrder id="SendMinionsIO">
        <Abil value="attack"/>
        <WhichUnit Effect="SendMinions@Set"/>
        <Target Effect="SendMinions" Value="TargetUnitOrPoint"/>
    </CEffectIssueOrder>

    <!---Host: Call back Linked attacking Minion -->
    <CAbilEffectInstant id="HostRecallMinions">
        <Flags index="Transient" value="1"/>
        <CmdButtonArray index="Execute" DefaultButtonFace="HostRecallMinions" Requirements="CBU_HostHasLinkedAttackingMinion"/>
        <Flags index="AllowMovement" value="1"/>
        <Flags index="NoDeceleration" value="1"/>
        <Arc value="360"/>
    </CAbilEffectInstant>
    <CEffectSet id="HostRecallMinions">
        <EffectArray value="HostRecallMinions@ETU"/>
        <TargetLocationType value="UnitOrPoint"/>
    </CEffectSet>
    <CEffectEnumTrackedUnits id="HostRecallMinions@ETU">
        <BehaviorLink value="CombineMinionTracker"/>
        <Effect value="HostRecallMinions@Set"/>
    </CEffectEnumTrackedUnits>
    <CEffectSet id="HostRecallMinions@Set">
        <EffectArray value="HostRecallMinions@IO"/>
    </CEffectSet>
    <CEffectIssueOrder id="HostRecallMinions@IO">
        <Abil value="MinionRecallTargeted"/>
        <WhichUnit Effect="HostRecallMinions@Set"/>
    </CEffectIssueOrder>

    <!--Minion: Fuse Minion with its linked Host -->
    <CAbilEffectInstant id="MinionRecall">
        <Flags index="Transient" value="1"/>
        <CmdButtonArray index="Execute" DefaultButtonFace="Minion" Requirements="CBU_MinionLinked"/>
        <Flags index="AllowMovement" value="1"/>
        <Flags index="NoDeceleration" value="1"/>
        <Arc value="360"/>
        <Flags index="AutoCast" value="1"/>
        <Flags index="AutoCastOn" value="1"/>
        <AutoCastFilters value="-;Self,Player,Ally,Neutral,Structure,Missile,Stasis,Dead,Hidden"/>
        <AutoCastRange value="1"/>
        <AutoCastValidatorArray value="CasterIsNotMovingOrAttacking"/>
        <AutoCastValidatorArray value="IsMinionLinked"/>
    </CAbilEffectInstant>
    <CEffectEnumTrackedUnits id="MinionRecall">
        <BehaviorLink value="CombineHostTracker"/>
        <Effect value="MinionRecall@IO"/>
    </CEffectEnumTrackedUnits>
    <CEffectIssueOrder id="MinionRecall@IO">
        <Abil value="MinionRecallTargeted"/>
        <WhichUnit Value="Caster"/>
        <Target Effect="MinionRecall@IO" Value="TargetUnit"/>
    </CEffectIssueOrder>
    <!--Minion: Fuse Minion with their Linked Host (not clickable, only used with MinionRecall)-->
    <CAbilEffectTarget id="MinionRecallTargeted">
        <Range value="0.1"/>
        <CmdButtonArray index="Execute" DefaultButtonFace="MinionRecallTargeted" Requirements="CBU_MinionLinked"/>
        <Flags index="AllowMovement" value="1"/>
        <Flags index="NoDeceleration" value="1"/>
        <TargetFilters value="Ground,Visible;Self,Ally,Neutral,Enemy,Structure,Missile,Stasis,Dead,Hidden"/>
        <Arc value="360"/>
    </CAbilEffectTarget>
    <CEffectSet id="MinionRecallTargeted">
        <TargetLocationType value="Unit"/>
        <EffectArray value="MinionLinked@RB"/>
        <EffectArray value="HostLinked@RB"/>
        <EffectArray value="HostFused@AB"/>
        <EffectArray value="HostCombined@TP"/>
        <EffectArray value="HostCombined@AK"/>
        <EffectArray value="MinionFused@ABCaster"/>
        <EffectArray value="Combine@DeselectMinion"/>
    </CEffectSet>

    <!--Requirements. used for buttons to show-->
    <CRequirement id="CBU_HostCombined">
        <NodeArray index="Show" Link="CBU_HostCombined"/>
    </CRequirement>
    <CRequirement id="NBU_MinionLinked">
        <NodeArray index="Show" Link="NBU_MinionLinked"/>
    </CRequirement>
    <CRequirement id="CBU_MinionLinked">
        <NodeArray index="Show" Link="CBU_MinionLinked"/>
    </CRequirement>
    <CRequirement id="CBU_HostHasLinkedAttackingMinion">
        <NodeArray index="Show" Link="CBU_HostHasLinkedAttackingMinion"/>
    </CRequirement>
    <!-- CBU - count behavior at unit GT 0 -->
    <CRequirementCountBehavior parent="CBU" id="CBU_HostCombined" behavior="HostCombined"/>
    <CRequirementCountBehavior parent="CBU" id="CBU_MinionLinked" behavior="MinionLinked"/>
    <CRequirementCountBehavior parent="CBU" id="CBU_HostHasLinkedAttackingMinion" behavior="HostLinked"/>
    <!-- CBU - count behavior at unit EQ 0 -->
    <CRequirementNot parent="NBU" id="NBU_MinionLinked" behavior="MinionLinked"/>

    <!--utility kinetic. used to follow linked host unit-->
    <CKineticFollow id="FollowTargetPosition">
        <Where Value="TargetUnit"/>
        <Follow value="Position"/>
    </CKineticFollow>
    <!--utility validators-->
    <CValidatorCombine id="TargetIsNotMovingOrAttacking">
        <Type value="And"/>
        <CombineArray value="TargetIsNotAttacking"/>
        <CombineArray value="TargetIsNotMoving"/>
    </CValidatorCombine>
    <CValidatorUnitOrderQueue id="TargetIsNotAttacking">
        <WhichUnit Value="Target"/>
        <AbilLink value="attack"/>
        <Find value="0"/>
    </CValidatorUnitOrderQueue>
    <CValidatorUnitOrderQueue id="TargetIsNotMoving">
        <WhichUnit Value="Target"/>
        <AbilLink value="move"/>
        <Find value="0"/>
    </CValidatorUnitOrderQueue>
    <CValidatorCombine id="CasterIsNotMovingOrAttacking">
        <Type value="And"/>
        <CombineArray value="CasterIsNotAttacking"/>
        <CombineArray value="CasterIsNotMoving"/>
    </CValidatorCombine>
    <CValidatorUnitOrderQueue id="CasterIsNotAttacking">
        <WhichUnit Value="Caster"/>
        <AbilLink value="attack"/>
        <Find value="0"/>
    </CValidatorUnitOrderQueue>
    <CValidatorUnitOrderQueue id="CasterIsNotMoving">
        <WhichUnit Value="Caster"/>
        <AbilLink value="move"/>
        <Find value="0"/>
    </CValidatorUnitOrderQueue>

    <CUnit id="Host">
        <BehaviorArray Link="CombineMinionTracker"/>
        <AbilArray Link="HostUncombine"/>
        <AbilArray Link="SendMinions"/>
        <AbilArray Link="HostRecallMinions"/>
        <CardLayouts index="0">
            <LayoutButtons Face="SendMinions" Type="AbilCmd" AbilCmd="SendMinions,Execute" Row="1" Column="1"/>
            <LayoutButtons Face="HostUncombine" Type="AbilCmd" AbilCmd="HostUncombine,Execute" Row="1" Column="0"/>
            <LayoutButtons Face="HostRecallMinions" Type="AbilCmd" AbilCmd="HostRecallMinions,Execute" Row="2" Column="4"/>
        </CardLayouts>
    </CUnit>


    <!--Units and Weapons-->
    <CUnit id="Minion">
        <BehaviorArray Link="CombineHostTracker"/>
        <AbilArray Link="Combine"/>
        <AbilArray Link="MinionRecallTargeted"/>
        <AbilArray Link="MinionRecall"/>
        <AbilArray Link="MinionUncombine"/>
        <CardLayouts index="0">
            <LayoutButtons Face="Combine" Type="AbilCmd" AbilCmd="Combine,Execute" Row="2" Column="0"/>
            <LayoutButtons Face="MinionRecallTargeted" Type="AbilCmd" AbilCmd="MinionRecall,Execute" Row="2" Column="4"/>
            <LayoutButtons Face="MinionUncombine" Type="AbilCmd" AbilCmd="MinionUncombine,Execute" Row="1" Column="0"/>
        </CardLayouts>
    </CUnit>
    
    
    
    
```

---

## 🔹 Шаг 1. Что такое Unit Tracker и зачем он нужен

### 💡 Назначение

`CBehaviorUnitTracker` — это поведение (Behavior), которое позволяет **одному юниту запоминать и отслеживать другого**.
Можно думать об этом как о **ссылке (reference)** между юнитами в игровом движке.

Используется, если:

* нужно, чтобы юниты знали своих “партнёров” (например, хозяина или подчинённого);
* нужно периодически применять эффекты к связанным юнитам;
* нужно удалять или менять связь при смерти или событии.

---

## 🔹 Шаг 2. Создаём два трекера

Мы создадим две стороны связи:

* `CombineHostTracker` — поведение у **Хоста**, хранит список **Миньонов**.
* `CombineMinionTracker` — поведение у **Миньона**, хранит ссылку на **Хоста**.

```xml
<!-- Хост: хранит ссылки на миньонов -->
<CBehaviorUnitTracker id="CombineHostTracker">
    <InfoFlags index="Hidden" value="1"/> <!-- не видно в UI -->
    <InfoIcon value="Assets\icons\\btn--unit-seeker.dds"/>
</CBehaviorUnitTracker>

<!-- Миньон: хранит ссылку на своего хоста -->
<CBehaviorUnitTracker id="CombineMinionTracker">
    <InfoFlags index="Hidden" value="1"/>
    <InfoIcon value="Assets\icons\\btn--unit-Minion.dds"/>
</CBehaviorUnitTracker>
```

---

## 🔹 Шаг 3. Эффекты добавления и удаления связи

### 🧩 Добавляем связь

Чтобы связать юнитов, используется эффект `CEffectAddTrackedUnit`.

* Указываем поведение (какой трекер),
* Кто **трекает** (TrackerUnit),
* И кто **отслеживаемый** (TrackedUnit).

```xml
<!-- Добавляем у хоста запись о миньоне -->
<CEffectAddTrackedUnit id="CombineHostTracker@ATU">
    <BehaviorLink value="CombineHostTracker"/>
    <TrackerUnit Value="Caster"/>   <!-- Хост -->
    <TrackedUnit Value="Target"/>   <!-- Миньон -->
</CEffectAddTrackedUnit>

<!-- Добавляем у миньона запись о хосте -->
<CEffectAddTrackedUnit id="CombineMinionTracker@ATU">
    <BehaviorLink value="CombineMinionTracker"/>
    <TrackerUnit Value="Target"/>   <!-- Хост -->
</CEffectAddTrackedUnit>
```

💬
**Как это работает:**
Когда Хост “сливает” Миньона, оба получают поведение, и каждый хранит ID другого.
Это позволяет впоследствии быстро получить всех Миньонов у Хоста или найти Хоста у Миньона.

---

### 🔄 Удаляем связь

Когда юнит умирает, отсоединяется или развязывается, нужно удалить запись:

```xml
<CEffectRemoveTrackedUnit id="CombineHostTracker@RTU">
    <BehaviorLink value="CombineHostTracker"/>
    <TrackedUnit Value="Target"/>
</CEffectRemoveTrackedUnit>

<CEffectRemoveTrackedUnit id="CombineMinionTracker@RTU">
    <BehaviorLink value="CombineMinionTracker"/>
    <TrackerUnit Value="Target"/>
</CEffectRemoveTrackedUnit>
```

---

## 🔹 Шаг 4. Создаём Buff’ы для логики

Buff — это способ “пометить” текущее состояние.

Пример:

```xml
<CBehaviorBuff id="MinionLinked">
    <InfoIcon value="Assets\icons\\btn--unit-seeker.dds"/>
    <Period value="0.0625"/>
    <PeriodicEffect value="MinionLinked@ETU"/>
</CBehaviorBuff>
```

Этот Buff “MinionLinked” означает, что Миньон **активно связан с Хостом**.
Каждые `0.0625` сек. он выполняет эффект — проверяет, остался ли приказ.

---

## 🔹 Шаг 5. Используем EnumTrackedUnits для работы со всеми связанными юнитами

`CEffectEnumTrackedUnits` — это мощный инструмент:
он **перебирает всех юнитов, связанных данным трекером**, и применяет к ним указанный эффект.

Например, заставить всех Миньонов атаковать цель:

```xml
<CEffectEnumTrackedUnits id="SendMinions@ETU">
    <BehaviorLink value="CombineMinionTracker"/>
    <Effect value="SendMinions@Switch"/>
</CEffectEnumTrackedUnits>
```

А внутри `SendMinions@Switch` мы решаем, что делать с каждым Миньоном:

* если он уже “linked” — просто отдать приказ на атаку;
* если он “fused” — сначала “разъединить” и потом атаковать.

---

## 🔹 Шаг 6. Создаём способности для взаимодействия

Теперь добавим **способности**, которые игрок может использовать через интерфейс.

### 6.1. Присоединить Миньонов к Хосту

```xml
<CAbilEffectTarget id="Combine">
    <Range value="1"/>
    <CmdButtonArray index="Execute" DefaultButtonFace="Combine"/>
    <AINotifyEffect value="HostCombined@AB"/>
</CAbilEffectTarget>
```

Эта способность позволяет Миньону выбрать Хоста и “вплавиться” в него.

---

### 6.2. Отсоединить Миньонов


* Проходит по всем связанным Миньонам (через `EnumTrackedUnits`);
* Удаляет buff `MinionLinked` у каждого;
* Разрывает связь в обе стороны;
* Хост теряет статус “Combined”.

```xml
<CAbilEffectInstant id="HostUncombine">
    <CmdButtonArray index="Execute" DefaultButtonFace="HostUncombine"/>
    <AINotifyEffect value="HostCombined@RB"/>
</CAbilEffectInstant>
```

---

### 6.3. Послать Миньонов в атаку

```xml
<CAbilEffectTarget id="SendMinions">
    <Range value="15"/>
    <CmdButtonArray index="Execute" DefaultButtonFace="Minion"/>
    <AutoCast value="1"/>
</CAbilEffectTarget>
```

---

### 6.4. Отозвать Миньонов

```xml
<CAbilEffectInstant id="HostRecallMinions">
    <CmdButtonArray index="Execute" DefaultButtonFace="HostRecallMinions"/>
</CAbilEffectInstant>
```

---

## 🔹 Шаг 7. Валидаторы — чтобы всё не ломалось

Validators гарантируют, что способности работают только в правильных условиях:

* Миньон не может присоединиться, если уже присоединён.
* Хост не может принять больше N миньонов.
* Миньон может возвращаться только если не атакует и не двигается.

Пример:

```xml
<CValidatorUnitCompareBehaviorCount id="Combine@CombineLimit">
    <WhichUnit Value="Target"/>
    <Behavior value="HostCombined"/>
    <Compare value="LT"/>
    <Value value="1"/>
</CValidatorUnitCompareBehaviorCount>
```

---

## 🔹 Шаг 8. Кинематика (Kinetics) — движение Миньонов за Хостом

Когда Миньоны “слиты”, их модель прячется, а сами они следуют за позицией Хоста:

```xml
<CKineticFollow id="FollowTargetPosition">
    <Where Value="TargetUnit"/>
    <Follow value="Position"/>
</CKineticFollow>
```

Используется в эффектах:

```xml
<CEffectApplyKinetic id="HostCombined@AK">
    <ImpactUnit Value="Caster"/>
    <Kinetic value="FollowTargetPosition"/>
</CEffectApplyKinetic>
```


## 🔹 9. Проверка наличия Миньонов через `CValidatorCompareTrackedUnitsCount`

Теперь — самое важное для логики управления.

Иногда Хосту нужно **знать, есть ли у него Миньоны вообще**,
или **сколько их осталось**.
Для этого существует специальный валидатор:

```xml
<CValidatorCompareTrackedUnitsCount id="HasIdleMinion">
    <Compare value="NE"/> <!-- Not Equal (≠ 0) -->
    <BehaviorLink value="CombineMinionTracker"/> <!-- используем этот трекер -->
    <TrackedUnitValidatorArray value="TargetIsNotMovingOrAttacking"/> <!-- фильтруем -->
</CValidatorCompareTrackedUnitsCount>
```

📖 Разберём подробно:

| Поле                                             | Значение                     | Что делает                                                              |
| ------------------------------------------------ | ---------------------------- | ----------------------------------------------------------------------- |
| `Compare value="NE"`                             | Not Equal (≠ 0)              | проверяет, что связанных юнитов > 0                                     |
| `BehaviorLink value="CombineMinionTracker"` |                              | какой трекер проверять                                                  |
| `TrackedUnitValidatorArray`                      | TargetIsNotMovingOrAttacking | применяет доп. фильтр (только Миньоны, которые не атакуют/не двигаются) |

---

💬 То есть этот валидатор возвращает **TRUE**, если у Хоста есть хотя бы один Миньон,
который сейчас не занят действием — значит, можно активировать способность “Send Minions”.

---

### Пример использования в способности

```xml
<CAbilEffectTarget id="SendMinions">
    <AutoCastValidatorArray value="HasIdleMinion"/> <!-- проверка -->
</CAbilEffectTarget>
```



## 🔹 10. Разница между “Миньон отсоединяется” и “Хост отсоединяет Миньонов”

Это **два разных сценария** и **две разные способности**.
Они оба используют **remove-tracked-unit** эффекты,
но инициатор и направление связи — разные.

---

### 🧠 Вариант 1: Миньон сам отсоединяется

**Способность:**

```xml
<CAbilEffectInstant id="MinionUncombine">
    <CmdButtonArray index="Execute" DefaultButtonFace="MinionUncombine" Requirements="CBU_MinionLinked"/>
</CAbilEffectInstant>

<CEffectSet id="MinionUncombine">
    <EffectArray value="MinionLinked@RB"/> <!-- Удаляет buff "linked" -->
</CEffectSet>
```

🔹 **Кто инициатор:** Миньон (Caster).
🔹 **Что делает:**
* Удаляет buff `MinionLinked` с миньона, что приводит к инвалидации и завершению связанного с ним поведения HostCombined у хоста
* Миньон теряет связь с Хостом, Может двигаться и действовать самостоятельно.

> Эта способность работает “локально”: Миньон отсоединяет себя.
> Она не затрагивает других Миньонов и не изменяет состояние Хоста напрямую.

---

### 🧩 Вариант 2: Хост отсоединяет Миньонов

**Способность:**

```xml
<CAbilEffectInstant id="HostUncombine">
    <CmdButtonArray index="Execute" DefaultButtonFace="HostUncombine"
        Requirements="CBU_HostCombined"/>
    <AINotifyEffect value="HostCombined@RB"/>
</CAbilEffectInstant>

<CEffectSet id="HostUncombine">
    <EffectArray value="HostCombined@RB"/> <!-- Удаляет buff "combined" -->
</CEffectSet>
```

🔹 **Кто инициатор:** Хост (Caster).
🔹 **Что делает:**

* Прерывает все экземпляры поведения HostCombined у хоста.
* ЧЭтото приводит к разрыву связей со всеми Миньонам (через `EnumTrackedUnits`);

> Эта способность “глобальная”:
> один Хост может сразу **разъединить всех своих Миньонов**,
> что логично для массового контроля.

---


## 🔹 Шаг 10. Пример использования в юнитах

### Хост:

```xml
<CUnit id="Host">
    <BehaviorArray Link="CombineMinionTracker"/>
    <AbilArray Link="HostUncombine"/>
    <AbilArray Link="SendMinions"/>
    <AbilArray Link="HostRecallMinions"/>
</CUnit>
```

### Миньон:

```xml
<CUnit id="Minion">
    <BehaviorArray Link="CombineHostTracker"/>
    <AbilArray Link="Combine"/>
    <AbilArray Link="MinionRecall"/>
    <AbilArray Link="MinionUncombine"/>
</CUnit>
```

---

## 🔹 Шаг 11. Рекомендации по созданию таких систем

1. **Всегда делай симметричные трекеры** (у обоих сторон).
2. **Удаляй связи при любой смерти** (`Death Response` или `FinalEffect`).
3. **EnumTrackedUnits** — лучший способ массово дать приказы всем “детям”.
4. **Use Validators** — иначе можно создать “зомби-связи” после смерти.

---

## 🧩 Что важно помнить

| Элемент                                       | Назначение                                           |
| --------------------------------------------- |------------------------------------------------------|
| `CBehaviorUnitTracker`                        | Хранит связи между юнитами                           |
| `CEffectAddTrackedUnit` / `RemoveTrackedUnit` | Создают/удаляют связь                                |
| `CEffectEnumTrackedUnits`                     | Перебирает всех связанных юнитов                     |
| `CValidatorCompareTrackedUnitsCount`          | Проверяет условия связанные с отслеживаеыми юнитами  |

---





