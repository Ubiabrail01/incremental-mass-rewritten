const MASS_DILATION = {
    unlocked() { return hasElement(21) },
    onactive() {
		if (CHALS.inChal(14)) return
        if (player.md.active) player.md.particles = player.md.particles.add(tmp.md.rp_gain)
        player.md.active = !player.md.active
        ATOM.doReset()
        updateMDTemp()
    },
	isActive() {
		return player.md.active || CHALS.inChal(10) || CHALS.inChal(11) || CHALS.inChal(12) || FERMIONS.onActive("02") || FERMIONS.onActive("03")
	},
	getPenalty() {
		if (CHALS.inChal(12)) return 3/7
		var x = FERMIONS.onActive("02") ? 0.64 : 0.8
		if (tmp.fermions) x = Math.pow(x, 1 / tmp.fermions.effs[0][4])
		if (CHROMA.got("p2_2")) x /= CHROMA.eff("p2_2")
		return x
	},
	applyDil(x) {
		return expMult(x, tmp.md.penalty).min(x)
	},
    RPexpgain() {
        let x = E(2).add(tmp.md.upgs[5].eff).mul((tmp.chal && !CHALS.inChal(10))?tmp.chal.eff[10]:1)
        if (!player.md.active && hasTree("d1")) x = x.mul(1.25)
        if (FERMIONS.onActive("01")) x = x.div(10)
<<<<<<< HEAD
        if (QCs.active()) x = x.mul(tmp.qu.qc_eff[4])
        if (hasElement(24) && hasPrestige(0,40)) x = x.mul(tmp.elements.effect[24])
=======
>>>>>>> 4fd55f51fdbcf0b366018d68122f0cb6c17fd252
        return x
    },
    RPmultgain() {
        let x = E(1).mul(tmp.md.upgs[2].eff)
        if (hasElement(24) && !hasPrestige(0,40)) x = x.mul(tmp.elements.effect[24])
        if (hasElement(31)) x = x.mul(tmp.elements.effect[31])
        if (hasElement(34)) x = x.mul(tmp.elements.effect[34])
        if (hasElement(45)) x = x.mul(tmp.elements.effect[45])
        x = x.mul(tmp.fermions.effs[0][1]||1)
        return x
    },
	RPbasegain(m=player.mass) {
		return m.div(uni(1)).max(1).log10().div(40).sub(14)
	},
	RPmassgain(m=player.mass) {
		if (CHALS.inChal(11)) return E(0)
		return this.RPbasegain(m).pow(tmp.md.rp_exp_gain)
	},
	RPgain(m=player.mass) {
		let x = this.RPmassgain(m).min(this.undercapacity()).mul(tmp.md.rp_mult_gain)
		return x.sub(player.md.particles).max(0).floor()
	},
	undercapacity() {
		return player.mass.pow(1e-6).max("ee10")
	},
    massGain() {
        if (CHALS.inChal(11)) return E(0)
        let pow = E(2)
        let x = player.md.particles.pow(pow)
        x = x.mul(tmp.md.upgs[0].eff)
        if (hasElement(22)) x = x.mul(tmp.elements.effect[22])
        if (hasElement(35)) x = x.mul(tmp.elements.effect[35])
        if (hasElement(40)) x = x.mul(tmp.elements.effect[40])
        if (hasElement(32)) x = x.pow(1.05)
<<<<<<< HEAD
        if (QCs.active()) x = x.pow(tmp.qu.qc_eff[4])
        return x.softcap(mlt(1e12),0.5,0)
=======
        return x
>>>>>>> 4fd55f51fdbcf0b366018d68122f0cb6c17fd252
    },
    mass_req() {
        let x = E(10).pow(player.md.particles.add(1).div(tmp.md.rp_mult_gain).root(tmp.md.rp_exp_gain).add(14).mul(40)).mul(1.50005e56)
        return x
    },
    effect() {
        let x = player.md.mass.max(1).log10().add(1).root(3).mul(tmp.md.upgs[1].eff)
        return x
    },
    upgs: {
        buy(x) {
            if (tmp.md.upgs[x].can) {
                if (!hasElement(43)) player.md.mass = player.md.mass.sub(this.ids[x].cost(tmp.md.upgs[x].bulk.sub(1))).max(0)
                player.md.upgs[x] = player.md.upgs[x].max(tmp.md.upgs[x].bulk)
            }
        },
        ids: [
            {
                desc: `Double dilated mass gain.`,
                cost(x) { return E(10).pow(x).mul(10) },
                bulk() { return player.md.mass.gte(10)?player.md.mass.div(10).max(1).log10().add(1).floor():E(0) },
                effect(x) {
                    let b = 2
                    if (hasElement(25)) b++
                    if (hasTree("ext_u1")) return E(b).pow(x)
                    return E(b).pow(x.mul(tmp.md.upgs[11].eff||1)).softcap('e1.2e4',0.96,2)
                },
                effDesc(x) { return format(x,0)+"x"+(hasTree("ext_u1")?"":getSoftcapHTML(x,'e1.2e4')) },
            },{
                desc: `Make dilated mass effect stronger.`,
                cost(x) { return E(10).pow(x).mul(100) },
                bulk() { return player.md.mass.gte(100)?player.md.mass.div(100).max(1).log10().add(1).floor():E(0) },
				effect(x) {
					if (!hasTree("ext_u1")) x = x.mul(tmp.md.upgs[11].eff||1)
					if (player.md.upgs[7].gte(1)) return x.root(1.5).mul(0.25).add(1)
					return x.root(2).mul(0.15).add(1)
				},
                effDesc(x) { return (x.gte(10)?format(x)+"x":format(x.sub(1).mul(100))+"%")+" stronger" },
            },{
                desc: `Double relativistic particles gain.`,
                cost(x) { return E(10).pow(x.pow(E(1.25).pow(tmp.md.upgs[4].eff||1))).mul(1000) },
                bulk() { return player.md.mass.gte(1000)?player.md.mass.div(1000).max(1).log10().root(E(1.25).pow(tmp.md.upgs[4].eff||1)).add(1).floor():E(0) },
				effect(x) {
                    if (hasTree("ext_u1")) return E(2).pow(x)
					return E(2).pow(x.mul(tmp.md.upgs[11].eff||1)).softcap(1e25,0.75,0)
				},
                effDesc(x) { return format(x,0)+"x"+(hasTree("ext_u1")?"":getSoftcapHTML(x,1e25)) },
            },{
                desc: `Dilated mass also boost Stronger's power.`,
                maxLvl: 1,
                cost(x) { return E(1.619e20).mul(25) },
                bulk() { return player.md.mass.gte(E(1.619e20).mul(25))?E(1):E(0) },
                effect(x) { return player.md.mass.max(1).log(100).root(3).div(8).add(1) },
                effDesc(x) { return format(x)+"x" },
            },{
                desc: `Mass Dilation upgrade 3 scales 10% weaker.`,
                maxLvl: 5,
                cost(x) { return E(1e5).pow(x).mul(E(1.619e20).mul(1e4)) },
                bulk() { return player.md.mass.gte(E(1.619e20).mul(1e4))?player.md.mass.div(E(1.619e20).mul(1e4)).max(1).log(1e5).add(1).floor():E(0) },
                effect(x) { return E(1).sub(x.mul(0.1)) },
                effDesc(x) { return format(E(1).sub(x).mul(100))+"% weaker" },
            },{
                desc: `Increase the exponent of the RP formula.`,
                cost(x) { return E(1e3).pow(x.pow(1.5)).mul(1.5e73) },
                bulk() { return player.md.mass.gte(1.5e73)?player.md.mass.div(1.5e73).max(1).log(1e3).max(0).root(1.5).add(1).floor():E(0) },
                effect(i) {
                    let s = E(0.25).add(tmp.md.upgs[10].eff||1)
                    let x = i.mul(s)
                    if (hasElement(53)) x = x.mul(1.75)
                    if (hasRank("pent", 75)) return x.softcap(1e3,6/7,0).softcap(1e3,x.log10(),1)
                    return x.softcap(1e3,0.6,0)
                },
                effDesc(x) { return "+^"+format(x)+getSoftcapHTML(x,1e3) },
            },{
                desc: `Dilated mass boost quarks gain.`,
                maxLvl: 1,
                cost(x) { return E(1.5e191) },
                bulk() { return player.md.mass.gte(1.5e191)?E(1):E(0) },
                effect(x) { return E(5).pow(player.md.mass.max(1).log10().root(2)) },
                effDesc(x) { return format(x)+"x" },
            },{
                desc: `Mass Dilation upgrade 2 effect's formula is better.`,
                maxLvl: 1,
                cost(x) { return E(1.5e246) },
                bulk() { return player.md.mass.gte(1.5e246)?E(1):E(0) },
            },{
                unl() { return STARS.unlocked() || player.supernova.times.gte(1) },
                desc: `Tickspeed affect all-star resources at a reduced rate.`,
                maxLvl: 1,
                cost(x) { return E(1.5e296) },
                bulk() { return player.md.mass.gte(1.5e296)?E(1):E(0) },
                effect(x) { return player.tickspeed.add(1).pow(2/3) },
                effDesc(x) { return format(x)+"x" },
            },{
                unl() { return STARS.unlocked() || player.supernova.times.gte(1) },
                desc: `Double quarks gain.`,
                cost(x) { return E(5).pow(x).mul('1.50001e536') },
                bulk() { return player.md.mass.gte('1.50001e536')?player.md.mass.div('1.50001e536').max(1).log(5).add(1).floor():E(0) },
				effect(x) {
					let r = E(2).pow(x)
					if (!hasTree("ext_u1")) r = r.softcap(1e25,2/3,0)
					return r
				},
                effDesc(x) { return format(x)+"x"+(hasTree("ext_u1")?"":getSoftcapHTML(x,1e25)) },
            },{
                unl() { return player.supernova.times.gte(1) },
                desc: `Add 0.015 Mass Dilation upgrade 6's base.`,
                cost(x) { return E(1e50).pow(x.pow(1.5)).mul('1.50001e1556') },
                bulk() { return player.md.mass.gte('1.50001e1556')?player.md.mass.div('1.50001e1556').max(1).log(1e50).max(0).root(1.5).add(1).floor():E(0) },
                effect(x) {
                    return x.mul(0.015).add(1).softcap(1.2,0.75,0).sub(1)
                },
                effDesc(x) { return "+"+format(x)+getSoftcapHTML(x,0.2) },
            },{
                unl() { return player.supernova.post_10 && !hasTree("ext_u1") },
                desc: `Strengthen first 3 upgrades.`,
                cost(x) { return E(1e100).pow(x.pow(2)).mul('1.5e8056') },
                bulk() { return player.md.mass.gte('1.5e8056')?player.md.mass.div('1.5e8056').max(1).log(1e100).max(0).root(2).add(1).floor():E(0) },
                effect(x) {
                    return x.sqrt().softcap(3.5,0.5,0).div(100).add(1).softcap(4,0.25,0)
                },
                effDesc(x) { return "+"+format(x.sub(1).mul(100))+"% stronger"+getSoftcapHTML(x,1.035,4) },
            },
        ],
    },
<<<<<<< HEAD

    break: {
        toggle() {
            let bd = player.md.break

            bd.active = !bd.active

            if (!bd.active) if (confirm("Are you sure you want to fix Dilation?")) {
                bd.energy = E(0)
                bd.mass = E(0)
                for (let x = 0; x < MASS_DILATION.break.upgs.ids.length; x++) bd.upgs[x] = E(0)

                QUANTUM.enter(false,true,false,true)
            } else bd.active = true
        },
        energyGain() {
            if (!player.md.break.active || !player.qu.rip.active) return E(0)

            let x = player.md.mass.add(1).log10().sub(400).div(2).max(0)
            x = x.add(1).pow(x.add(1).log10()).sub(1)

            if (hasPrestige(0,10)) x = x.mul(prestigeEff(0,10))
            x = x.mul(tmp.bd.upgs[5].eff||1)
            if (hasElement(116)) x = x.mul(tmp.elements.effect[116]||1)

            return x
        },
        massGain() {
            let x = player.md.break.energy.max(0).pow(2)
            x = x.mul(tmp.bd.upgs[0].eff||1)
            if (player.md.break.upgs[7].gte(1)) x = x.mul(tmp.bd.upgs[7].eff||1)
            if (player.md.break.upgs[8].gte(1)) x = x.mul(tmp.bd.upgs[8].eff||1)

            return x
        },

        upgs: {
            buy(x) {
                if (tmp.bd.upgs[x].can) {
                    player.md.break.mass = player.md.break.mass.sub(this.ids[x].cost(tmp.bd.upgs[x].bulk.sub(1))).max(0)
                    player.md.break.upgs[x] = player.md.break.upgs[x].max(tmp.bd.upgs[x].bulk)

                    if (x == 2) {
                        player.md.upgs[1] = E(0)

                        updateMDTemp()
                    }

                    updateBDTemp()
                }
            },
            ids: [
                {
                    desc: `Double Relativistic Mass gain.`,
                    cost(x) { return E(10).pow(x.pow(1.1)).mul(1e5) },
                    bulk() { return player.md.break.mass.gte(1e5)?player.md.break.mass.div(1e5).max(1).log10().root(1.1).add(1).floor():E(0) },
                    effect(y) {
                        let x = Decimal.pow(2,y)

                        return x.softcap(1e15,0.5,0)
                    },
                    effDesc(x) { return format(x,0)+"x"+x.softcapHTML(1e15) },
                },{
                    desc: `Increase the exponent of the Dilated Mass formula.`,
                    cost(x) { return E(10).pow(x.pow(1.25)).mul(1e7) },
                    bulk() { return player.md.break.mass.gte(1e7)?player.md.break.mass.div(1e7).max(1).log10().root(1.25).add(1).floor():E(0) },
                    effect(y) {
                        let x = y.div(40)
                
                        return x
                    },
                    effDesc(x) { return "+^"+format(x) },
                },{
                    desc: `Multiplier from DM effect is transformed to Exponent (at a reduced rate, is weaker while Big Ripped), but second MD upgrade's cost is exponentally increased. Purchasing this upgrade will reset it.`,
                    maxLvl: 1,
                    cost(x) { return E(1.619e23) },
                    bulk() { return player.md.break.mass.gte(1.619e23)?E(1):E(0) },
                },{
                    desc: `11th MD Upgrade is 50% stronger, its effected level softcaps at 1e18.`,
                    maxLvl: 1,
                    cost(x) { return E(1.989e33) },
                    bulk() { return player.md.break.mass.gte(1.989e33)?E(1):E(0) },
                },{
                    desc: `Meta-Rank scales later.`,
                    cost(x) { return E(10).pow(x.pow(2)).mul(1.989e36) },
                    bulk() { return player.md.break.mass.gte(1.989e36)?player.md.break.mass.div(1.989e36).max(1).log10().root(2).add(1).floor():E(0) },
                    effect(y) {
                        let x = y.div(10).add(1)
                
                        return x
                    },
                    effDesc(x) { return "x"+format(x)+" later" },
                },{
                    desc: `Triple Relativistic Energies gain.`,
                    cost(x) { return E(10).pow(x.pow(1.5)).mul(2.9835e48) },
                    bulk() { return player.md.break.mass.gte(2.9835e48)?player.md.break.mass.div(2.9835e48).max(1).log10().root(1.5).add(1).floor():E(0) },
                    effect(y) {
                        let x = Decimal.pow(3,y)

                        return x
                    },
                    effDesc(x) { return format(x,0)+"x" },
                },{
                    desc: `Death Shard & Entropy boosts each other.`,
                    maxLvl: 1,
                    cost(x) { return uni(1e35) },
                    bulk() { return player.md.break.mass.gte(uni(1e35))?E(1):E(0) },
                    effect(y) {
                        let x = [player.qu.rip.amt.add(1).log10().add(1).pow(2),player.qu.en.amt.add(1).log10().add(1).pow(1.5)]

                        return x
                    },
                    effDesc(x) { return x[0].format()+"x to Entropies gain, "+x[1].format()+"x to Death Shards gain" },
                },{
                    desc: `Relativistic Mass gain is increased by 75% for every OoM^2 of dilated mass.`,
                    maxLvl: 1,
                    cost(x) { return uni(1e48) },
                    bulk() { return player.md.break.mass.gte(uni(1e48))?E(1):E(0) },
                    effect(y) {
                        let x = E(1.75).pow(player.md.mass.add(1).log10().add(1).log10())

                        return x
                    },
                    effDesc(x) { return format(x)+"x" },
                },{
                    desc: `Pre-Quantum Global Speed affects Relativistic Mass gain at a severely reduced rate.`,
                    maxLvl: 1,
                    cost(x) { return uni(1e100) },
                    bulk() { return player.md.break.mass.gte(uni(1e100))?E(1):E(0) },
                    effect(y) {
                        let x = (tmp.preQUGlobalSpeed||E(1)).add(1).root(10)

                        return x
                    },
                    effDesc(x) { return format(x)+"x" },
                },{
                    desc: `Super Prestige Level starts 10 later.`,
                    maxLvl: 1,
                    cost(x) { return uni(1e120) },
                    bulk() { return player.md.break.mass.gte(uni(1e120))?E(1):E(0) },
                },
            ],
        }
    },
=======
>>>>>>> 4fd55f51fdbcf0b366018d68122f0cb6c17fd252
}

function setupMDHTML() {
    let md_upg_table = new Element("md_upg_table")
	let table = ""
	for (let i = 0; i < MASS_DILATION.upgs.ids.length; i++) {
        let upg = MASS_DILATION.upgs.ids[i]
        table += `
        <button onclick="MASS_DILATION.upgs.buy(${i})" class="btn full md" id="md_upg${i}_div" style="font-size: 11px;">
        <div style="min-height: 80px">
            [Level <span id="md_upg${i}_lvl"></span>]<br>
            ${upg.desc}<br>
            ${upg.effDesc?`Currently: <span id="md_upg${i}_eff"></span>`:""}
        </div>
        <span id="md_upg${i}_cost"></span>
        </button>
        `
	}
	md_upg_table.setHTML(table)
}

function updateMDTemp() {
    if (!tmp.md) tmp.md = {}
	tmp.md.active = MASS_DILATION.isActive()
	tmp.md.penalty = MASS_DILATION.getPenalty()
    if (!tmp.md.upgs) {
        tmp.md.upgs = []
        for (let x = 0; x < MASS_DILATION.upgs.ids.length; x++) tmp.md.upgs[x] = {}
    }
<<<<<<< HEAD
    tmp.md.bd3 = player.md.break.upgs[2].gte(1)
    let mdub = 1
    if (hasElement(115)) mdub *= 1.05
=======
>>>>>>> 4fd55f51fdbcf0b366018d68122f0cb6c17fd252
    for (let x = 0; x < MASS_DILATION.upgs.ids.length; x++) {
        let upg = MASS_DILATION.upgs.ids[x]
        tmp.md.upgs[x].cost = upg.cost(player.md.upgs[x])
        tmp.md.upgs[x].bulk = upg.bulk().min(upg.maxLvl||1/0)
        tmp.md.upgs[x].can = player.md.mass.gte(tmp.md.upgs[x].cost) && player.md.upgs[x].lt(upg.maxLvl||1/0)
        if (upg.effect) tmp.md.upgs[x].eff = upg.effect(player.md.upgs[x].mul(mdub))
    }
    tmp.md.rp_exp_gain = MASS_DILATION.RPexpgain()
    tmp.md.rp_mult_gain = MASS_DILATION.RPmultgain()
    tmp.md.rp_gain = MASS_DILATION.RPgain()
    tmp.md.passive_rp_gain = hasTree("qol3")?MASS_DILATION.RPgain(MASS_DILATION.applyDil(player.mass)):E(0)
    tmp.md.mass_gain = MASS_DILATION.massGain()
    tmp.md.mass_req = MASS_DILATION.mass_req()
    tmp.md.mass_eff = MASS_DILATION.effect()
}

function updateMDHTML() {
	let exp = AXION.unl() ? tmp.ax.eff[19] : E(1)
    elm.md_particles.setTxt(format(player.md.particles,0)+(hasTree("qol3")?" "+formatGain(player.md.particles,tmp.md.passive_rp_gain):""))
    elm.md_eff.setTxt(exp.gt(1)?"^"+format(exp,3):tmp.md.mass_eff.gte(10)?format(tmp.md.mass_eff)+"x":format(tmp.md.mass_eff.sub(1).mul(100))+"%")
    elm.md_mass.setTxt(formatMass(player.md.mass)+" "+formatGain(player.md.mass,tmp.md.mass_gain,true))
    elm.md_undercapacity.setHTML(MASS_DILATION.RPmassgain().gt(MASS_DILATION.undercapacity())?"Base RP is undercapacitied at "+format(MASS_DILATION.undercapacity())+" to prevent temporal anomalies!<br>":"")
    elm.md_btn.setTxt(player.md.active
        ?(tmp.md.rp_gain.gte(1)?`Cancel for ${format(tmp.md.rp_gain,0)} Relativistic particles`:`Reach ${formatMass(tmp.md.mass_req)} to gain Relativistic particles, or cancel dilation`)
        :"Dilate Mass"
    )
    for (let x = 0; x < MASS_DILATION.upgs.ids.length; x++) {
        let upg = MASS_DILATION.upgs.ids[x]
        let unl = upg.unl?upg.unl():true
        elm["md_upg"+x+"_div"].setVisible(unl)
        if (unl) {
            elm["md_upg"+x+"_div"].setClasses({btn: true, full: true, md: true, locked: !tmp.md.upgs[x].can})
            elm["md_upg"+x+"_lvl"].setTxt(format(player.md.upgs[x],0)+(upg.maxLvl!==undefined?" / "+format(upg.maxLvl,0):""))
            if (upg.effDesc) elm["md_upg"+x+"_eff"].setHTML(upg.effDesc(tmp.md.upgs[x].eff))
            elm["md_upg"+x+"_cost"].setTxt(player.md.upgs[x].lt(upg.maxLvl||1/0)?"Cost: "+formatMass(tmp.md.upgs[x].cost):"")
        }
    }
}