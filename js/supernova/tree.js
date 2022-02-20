const TREE_IDS = [
    ["qol_ext2","qol_ext1","","qol1","","","s3","s2","s1","c","sn1","sn2","sn3","","","chal1","","","feat1"],
    ["qol_ext4","qol_ext3","qol2","qol3","qol4","","s4","","m1","rp1","bh1","","sn4","","chal2","chal4a","chal3","","feat2"],
    ["qol_ext6","qol_ext5","qol5","qol6","qol7","","","m2","t1","","bh2","gr1","sn5","","","chal4","","","feat3"],
    ["","","","unl1","qol8","","m3","","","d1","","","gr2","","chal5","chal6","chal7","","feat4"],
    ["","","","qol10","qol9","","","bs4","bs2","bs1","bs3","","","","","","","","feat5"],
    ["","","","","","","fn8","","","fn1","fn5","","","","","","","","feat6"],
    ["","","","","","","fn7","fn6","fn2","fn3","fn4","","","","","","","",""],
    ["","","","","","","","rad4","rad2","rad1","rad3","","","","","","","",""],
    ["","","","","","","","","","","","","ext2","ext3","","","","",""],
    ["","","","","","","","","","eb1","eb2","ext1","ext5","","","","","",""],
    ["","","","","","","","","","","","","ext4","","","","","",""],
    ["","","","","","","","","","","","","","","","","","",""],
    ["","","","","","","","","","","","","","","","","","",""],
    ["","","","","","","","","","","","","","","","","","",""],
    ["","","","","","","","","","","","","","","","","","",""],
    ["","","","","","","","","","","","","","","","","","",""],
    ["","","","","","","","","","","","","","","","","","",""],
    ["","","","","","","","","","","","","","","","","","",""],
    ["","","","","","","","","","","","","","","","","","",""],
]

var tree_canvas,tree_ctx,tree_update=true

const TREE_UPGS = {
    buy(x) {
        if (tmp.supernova.tree_choosed == x && tmp.supernova.tree_afford[x]) {
            player.supernova.stars = player.supernova.stars.sub(this.ids[x].cost).max(0)
            player.supernova.tree.push(x)
        }
    },
    ids: {
        c: {
            desc: `Start generating 0.1 Neutron Star per second (not affected by offline production).`,
			perm: true,
            cost: E(0),
        },
        sn1: {
            branch: ["c"],
            desc: `Tickspeed affects Neutron Star gain at a reduced rate.`,
            cost: E(10),
            effect() {
                let x = player.tickspeed.add(1).pow(0.25)
                return x
            },
            effDesc(x) { return format(x)+"x" },
        },
        sn2: {
            branch: ["sn1"],
            desc: `Supernova boosts Neutron Star gain.`,
            cost: E(350),
            effect() {
                let x = E(2).add(player.supernova.tree.includes("sn4")?tmp.supernova.tree_eff.sn4:0).pow(player.supernova.times.softcap(15,0.8,0).softcap(25,0.5,0))
                return x
            },
            effDesc(x) { return format(x)+"x" },
        },
        sn3: {
            branch: ["sn2"],
            desc: `Blue star boost Neutron star gain at a reduced rate.`,
            req() { return player.supernova.times.gte(6) },
            reqDesc: `6 Supernovas.`,
            cost: E(50000),
            effect() {
                let x = player.stars.generators[4].max(1).log10().add(1)
                return x
            },
            effDesc(x) { return format(x)+"x" },
        },
        sn4: {
            branch: ["sn3"],
            desc: `Tree “sn2”'s effect base is increased by Supernova.`,
            unl() { return player.supernova.post_10 },
            req() { return player.supernova.times.gte(13) },
            reqDesc: `13 Supernovas.`,
            cost: E(1e8),
            effect() {
                let x = player.supernova.times.mul(0.1).softcap(1.5,0.75,0)
                return x
            },
            effDesc(x) { return "+"+format(x)+(x.gte(1.5)?" <span class='soft'>(softcapped)</span>":"") },
        },
        m1: {
            branch: ["c"],
            desc: `Neutron star multiplies Mass gain.`,
            cost: E(100),
            effect() {
                let x = E(1e100).pow(player.supernova.stars.add(1).log10().pow(5).softcap(1e3,0.25,0))
                return x
            },
            effDesc(x) { return format(x)+"x"+(x.max(1).log(1e100).gte(1e3)?" <span class='soft'>(softcapped)</span>":"") },
        },
        m2: {
            branch: ["m1"],
            desc: `Multiplies the Mass requirement for softcap^2 by 1.5`,
            cost: E(800),
        },
        m3: {
            branch: ["m2"],
            unl() { return player.supernova.fermions.unl && player.supernova.tree.includes("fn1") },
            desc: `Mass gain softcap^2-3 starts later based on Supernovas.`,
            cost: E(1e46),
            effect() {
                let x = player.supernova.times.mul(0.0125).add(1)
                return x
            },
            effDesc(x) { return "^"+format(x)+" later" },
        },
        t1: {
            branch: ["m1", 'rp1'],
			req() {
				if (player.supernova.tree.includes("qol_ext1")) return true
				return player.supernova.chal.noTick && player.mass.gte(E("1.5e1.650056e6").pow(player.supernova.tree.includes('bh2')?1.46:1))
			},
            reqDesc() {return `Reach ${formatMass(E("1.5e1.650056e6").pow(player.supernova.tree.includes('bh2')?1.46:1))} without buying Tickspeed in Supernova run. You can still obtain Tickspeed from Cosmic Rays.`},
            desc: `Tickspeed Power is raised to the 1.15th.`,
            cost: E(1500),
        },
        rp1: {
            branch: ["c"],
            desc: `Neutron Stars multiplies Rage Powers gain`,
            cost: E(200),
            effect() {
                let x = E(1e50).pow(player.supernova.stars.add(1).log10().pow(5).softcap(1e3,0.25,0))
                return x
            },
            effDesc(x) { return format(x)+"x"+(x.max(1).log(1e50).gte(1e3)?" <span class='soft'>(softcapped)</span>":"") },
        },
        bh1: {
            branch: ["c"],
            desc: `Neutron Star multiplies Dark Matters gain.`,
            cost: E(400),
            effect() {
                let x = E(1e35).pow(player.supernova.stars.add(1).log10().pow(5).softcap(1e3,0.25,0))
                return x
            },
            effDesc(x) { return format(x)+"x"+(x.max(1).log(1e35).gte(1e3)?" <span class='soft'>(softcapped)</span>":"") },
        },
        bh2: {
            branch: ['bh1'],
			req() {
				if (player.supernova.tree.includes("qol_ext1")) return true
				return player.supernova.chal.noBHC && player.bh.mass.gte("1.5e1.7556e4")
			},
            reqDesc() {return `Reach ${format("e1.75e4")} uni of black hole without buying any BH Condenser in Supernova run.`},
            desc: `BH Condenser power is raised to the 1.15th.`,
            cost: E(1500),
        },
        s1: {
            branch: ["c"],
            desc: `Neutron Star boosts last star gain.`,
            cost: E(400),
            effect() {
                let x = player.supernova.stars.add(1).pow(1.4)
                return x
            },
            effDesc(x) { return format(x)+"x" },
        },
        s2: {
            branch: ["s1"],
            req() { return player.supernova.times.gte(3) },
            reqDesc: `3 Supernovas.`,
            desc: `Star boost's Tetr's softcap is 50% weaker.`,
            cost: E(2500),
        },
        s3: {
            branch: ["s2"],
            req() { return player.supernova.times.gte(4) },
            reqDesc: `4 Supernovas.`,
            desc: `Star generators are stronger based on Supernova.`,
            cost: E(10000),
            effect() {
                let x = player.supernova.times.max(0).root(10).mul(0.1).add(1).min(1.15)
                return x
            },
            effDesc(x) { return "^"+format(x) },
        },
        s4: {
            branch: ["s3"],
            req() { return player.supernova.times.gte(6) },
            reqDesc: `6 Supernovas.`,
            desc: `Beyond unlocking stars, Star Unlocker will transform into Booster.`,
            cost: E(1e5),
        },
        qol1: {
            req() { return player.supernova.times.gte(2) },
            reqDesc: `2 Supernovas.`,
            desc: `Start with Silicon-14 & Argon-18 unlocked. You can now automatically buy Elements & Atom upgrades.`,
			perm: true,
            cost: E(1500),
        },
        qol2: {
            branch: ["qol1"],
            req() { return player.supernova.times.gte(3) },
            reqDesc: `3 Supernovas.`,
            desc: `Start with Chromium-24 and Atom upgrade 6 unlocked.`,
			perm: true,
            cost: E(2000),
        },
        qol3: {
            branch: ["qol2"],
            req() { return player.supernova.times.gte(4) },
            reqDesc: `4 Supernovas.`,
            desc: `Start with Techntium-43 unlocked, improve their element better. You can automatically gain Relativistic particles from mass.`,
			perm: true,
            cost: E(10000),
        },
        qol4: {
            branch: ["qol3"],
            unl() { return player.supernova.post_10 },
            req() { return player.supernova.times.gte(12) },
            reqDesc: `12 Supernovas.`,
            desc: `You can now automatically buy Star unlockers & boosters.`,
			perm: true,
            cost: E(1e8),
        },
        qol5: {
            branch: ["qol4"],
            req() { return player.supernova.times.gte(16) },
            reqDesc: `16 Supernovas.`,
            desc: `Tetrs no longer resets anything.`,
			perm: true,
            cost: E(1e13),
        },
        qol6: {
            branch: ["qol5"],
            req() { return player.supernova.times.gte(17) },
            reqDesc: `17 Supernovas.`,
            desc: `While in any challenge, you can now automatically complete it before exiting.`,
			perm: true,
            cost: E(1e15),
        },
        qol7: {
            branch: ["qol6"],
            unl() { return player.supernova.fermions.unl && player.supernova.tree.includes("fn2") },
            req() { return player.supernova.times.gte(40) },
            reqDesc: `40 Supernovas.`,
            desc: `You can now automatically buy Photon & Gluon upgrades, they no longer spent their amount.`,
			perm: true,
            cost: E(1e48),
        },
        chal1: {
            req() { return player.supernova.times.gte(4) },
            reqDesc: `4 Supernovas.`,
            desc: `Add 100 more C7 & C8 maximum completions.`,
            cost: E(6000),
        },
        chal2: {
            branch: ["chal1"],
            req() {
				if (player.supernova.tree.includes("qol_ext1")) return true
                for (let x = 1; x <= 4; x++) if (player.chal.comps[x].gte(1)) return false
                return player.mass.gte(E('e2.05e6').mul(1.5e56))
            },
            reqDesc() { return `Reach ${format('e2.05e6')} uni without challenge 1-4 completions in Supernova run.` },
            desc: `Keep challenge 1-4 completions on reset.`,
            cost: E(1e4),
        },
        chal3: {
            branch: ["chal1"],
            req() {
				if (player.supernova.tree.includes("qol_ext1")) return true
                for (let x = 5; x <= 8; x++) if (player.chal.comps[x].gte(1)) return false
                return player.bh.mass.gte(E('e1.75e4').mul(1.5e56))
            },
            reqDesc() { return `Reach ${format('e1.75e4')} uni of black hole without challenge 5-8 completions in Supernova run.` },
            desc: `Keep challenge 5-8 completions on reset.`,
            cost: E(1e4),
        },
        chal4: {
            branch: ["chal2","chal3"],
            desc: `Unlock new challenge.`,
            cost: E(1.5e4),
        },
        chal4a: {
            unl() { return player.supernova.post_10 },
            branch: ["chal4"],
            desc: `Make 9th Challenges effect better.`,
            cost: E(1e8),
        },
        chal5: {
            branch: ["chal4"],
            desc: `Unlock new challenge.`,
            cost: E(1e17),
        },
        gr1: {
            branch: ["bh1"],
            desc: `BH Condensers power boost Cosmic Rays power.`,
            req() { return player.supernova.times.gte(7) },
            reqDesc: `7 Supernovas.`,
            cost: E(1e6),
            effect() {
                let x = tmp.bh?tmp.bh.condenser_eff.pow.max(1).root(3):E(1)
                return x
            },
            effDesc(x) { return format(x)+"x" },
        },
        gr2: {
            unl() { return player.supernova.fermions.unl },
            branch: ["gr1"],
            desc: `Cosmic Rays Power is raised to 1.25th power.`,
            cost: E(1e20),
        },
        bs1: {
            unl() { return player.supernova.post_10 },
            req() { return player.supernova.times.gte(15) },
            reqDesc: `15 supernovas`,
            desc: `Tickspeed affect Higgs Bosons gain at a reduced rate.`,
            cost: E(1e13),
            effect() {
                let x = player.tickspeed.add(1).pow(0.6)
                return x
            },
            effDesc(x) { return format(x)+"x" },
        },
        bs2: {
            branch: ["bs1"],
            desc: `Photon, Gluon powers up each other.`,
            cost: E(1e14),
            effect() {
                let x = expMult(player.supernova.bosons.photon,1/2,2)
                let y = expMult(player.supernova.bosons.gluon,1/2,2)
                return [x,y]
            },
            effDesc(x) { return format(x[1])+"x to Photon, "+format(x[0])+"x to Gluon" },
        },
        bs3: {
            branch: ["bs1"],
            desc: `Neutrons gain is affected by Graviton's effect at a reduced rate.`,
            cost: E(1e14),
            effect() {
                let x = tmp.bosons.effect.graviton[0].add(1).root(2)
                return x
            },
            effDesc(x) { return format(x)+"x" },
        },
        bs4: {
            unl() { return player.supernova.fermions.unl },
            branch: ["bs2"],
            desc: `Raise Z Bosons gain to the 1.5th power.`,
            cost: E(1e24),
        },
        fn1: {
            unl() { return player.supernova.fermions.unl },
            branch: ["bs1"],
            desc: `Tickspeed affect each Fermions gain at a reduced rate.`,
            cost: E(1e27),
            effect() {
                let x = E(1.25).pow(player.tickspeed.pow(0.4))
                return x
            },
            effDesc(x) { return format(x)+"x" },
        },
        fn2: {
            branch: ["fn1"],
            req() { return player.supernova.tree.includes("qol_ext1") || (player.mass.div('1.5e56').gte("ee6") && player.md.active && FERMIONS.onActive("01")) },
            reqDesc() { return `Reach ${formatMass(E('e1e6').mul(1.5e56))} while dilating mass in [Down]` },
            desc: `Unlock 2 new types of U-Quark & U-Fermion.`,
            cost: E(1e33),
        },
        fn3: {
            branch: ["fn1"],
            req() { return player.supernova.fermions.points[0].gte(1e7) || player.supernova.fermions.points[1].gte(1e7) },
            reqDesc() { return `Reach ${format(1e7)} of any Fermions` },
            desc: `Super Fermion's Tier scaling is 7.5% weaker.`,
            cost: E(1e30),
        },
        fn4: {
            unl() { return player.supernova.tree.includes("fn2") },
            branch: ["fn1"],
            desc: `2nd Photon & Gluon upgrades are slightly stronger.`,
            cost: E(1e39),
        },
        fn5: {
            unl() { return player.supernova.tree.includes("fn2") },
            branch: ["fn1"],
            req() { return player.supernova.tree.includes("qol_ext1") || (player.atom.quarks.gte("e12500") && FERMIONS.onActive("10")) },
            reqDesc() { return `Reach ${format("e12500")} quarks while in [Electron]` },
            desc: `[Electron] max tier is increased by 35. Its effect softcap is weaker.`,
            cost: E(1e42),
        },
        fn6: {
            branch: ["fn2"],
            req() { return player.supernova.tree.includes("qol_ext1") || (player.mass.gte(uni('e4e4')) && FERMIONS.onActive("02") && CHALS.inChal(5)) },
            reqDesc() { return `Reach ${formatMass(uni("e4e4"))} while in [Charm] & Challenge 5.` },
            desc: `Unlock 2 new more types of U-Quark & U-Fermion.`,
            cost: E(1e48),
        },
        d1: {
            unl() { return player.supernova.tree.includes("fn6") },
            branch: ["rp1"],
            desc: `Generating Relativistic particles outside Mass dilation is 25% stronger.`,
            cost: E(1e51),
        },
        unl1: {
            branch: ["qol7"],
            unl() { return player.supernova.tree.includes("fn6") },
            req() { return player.supernova.times.gte(44) },
            reqDesc: `44 Supernovas.`,
            desc: `Unlock Radiation.`,
            cost: E(5e52),
        },
        rad1: {
            unl() { return tmp.radiation.unl },
            desc: `Gain more frequency based on Supernova, any more radiation if you unlocked next radiation.`,
            cost: E(1e54),
            effect() {
                let x = player.supernova.times.add(1)
                return x
            },
            effDesc(x) { return format(x)+"x" },
        },
        rad2: {
            branch: ["rad1"],
            desc: `Gain more Radiation based on Supernovas.`,
            cost: E(1e72),
            effect() {
				let sn = player.supernova.times
                let x = sn.div(300).add(1).min(2).pow(sn.sub(40)).max(1)
                return x
            },
            effDesc(x) { return format(x)+"x" },
        },
        qol8: {
            branch: ["qol7"],
            unl() { return player.supernova.tree.includes("qol7") },
            req() { return player.supernova.times.gte(50) },
            reqDesc: `50 Supernovas.`,
            desc: `You can automatically sweep challenges and fermions with at least 15 completions / tiers, after 1.5 seconds of Supernova.`,
            cost: E(1e65),
			perm: true,
			noIcon: true,
        },
        fn7: {
            branch: ["fn6"],
            unl() { return player.supernova.tree.includes("rad1") },
            desc: `Unlock 2 even more types of U-Quark & U-Fermion.`,
            cost: E(1e80),
        },
        chal6: {
            branch: ["chal5"],
            desc: `Unlock new challenge.`,
            cost: E(1e94),
        },
        sn5: {
            branch: ["sn4"],
            unl() { return player.supernova.tree.includes("rad1") },
            desc: `Supernova scalings are no longer rounded down to a integer, and unlock Pent.`,
            cost: E(3e99),
        },
        fn8: {
            branch: ["fn7"],
            desc: `Unlock 2 final types of U-Quark & U-Fermion.`,
            cost: E(1e128),
        },
        rad3: {
            branch: ["rad1"],
            desc: `Extra levels are raised based on radiation types.`,
            cost: E(4.56789e123),
        },
        qol9: {
            branch: ["qol8"],
            desc: `You can enter both U-Quarks and U-Leptons.`,
            cost: E(1e120),
			perm: true,
			noIcon: true,
        },
        chal7: {
            branch: ["chal6"],
            desc: `Unlock the finale of Supernova Challenges, Challenge 12.`,
            cost: E(1e170),
        },
        qol10: {
            branch: ["qol9"],
            desc: `You can do 2 challenges at once from sweeping. [Coming really soon!]`,
            cost: E(1/0),
			perm: true,
			noIcon: true,
        },
        feat1: {
            unl() { return player.supernova.tree.includes("rad1") },
            req() {
				if (!player.supernova.fermions.choosed) return
				if (!player.supernova.fermions.choosed2) return

				if (!featCheck()) return

				return player.mass.lt(player.stats.maxMass.pow(1e-3))
			},
            reqDesc: `Get at most ^0.001 of best mass within a U-Quark and a U-Lepton. [Automation must be on for all feats!]`,
            desc: `Gain 3x more Radiation.`,
            cost: E(1e130),
			perm: true,
			noIcon: true,
        },
        feat2: {
            unl() { return player.supernova.tree.includes("rad1") },
            req() {
				if (player.chal.active) return
				if (!player.md.active) return

				if (!featCheck()) return

				return player.mass.gte(player.supernova.maxMass.pow(0.1))
			},
            reqDesc: `Get ^0.1 of best mass for this Supernova within Mass Dilation.`,
            desc: `Add ^0.015 to Titanium-73 effect.`,
            cost: E(1e140),
			perm: true,
			noIcon: true,
        },
        feat3: {
            unl() { return player.supernova.tree.includes("rad1") },
            req() { return player.mass.gte(uni("e2.5e10")) && player.mainUpg.rp.length + player.mainUpg.bh.length + player.mainUpg.atom.length < 30 },
            reqDesc() { return "Get " + formatMass(uni("ee25")) + " with at most 30 Main Upgrades." },
            desc: `All Tickspeed scalings scale 35% weaker.`,
            cost: E(1e155),
			perm: true,
			noIcon: true,
        },
        eb1: {
            unl() { return player.ext.amt.gte(1) },
            desc: `Unlock Black Hole and Atomic Buildings #2.`,
            cost: E(1e10),
			perm: true,
			noIcon: true,
        },
        eb2: {
			branch: ["eb1"],
            desc: `Unlock Black Hole and Atomic Buildings #3.`,
            cost: E(1e200),
			perm: true,
			noIcon: true,
        },
        rad4: {
            unl() { return player.ext.amt.gte(1) },
            branch: ["rad2"],
            desc: `All Radiation Meta-Boosts are 50% stronger.`,
            cost: E(1e190),
        },
        feat4: {
            unl() { return player.ext.amt.gte(1) },
			req() {
				if (player.mass.lt(uni("ee9"))) return false
				let sum = E(0)
				for (var i = 1; i <= CHALS.cols; i++) sum = sum.add(player.chal.comps[i])
				for (var i = 1; i <= 4; i++) if (player.chal.comps[i].lte(sum.mul(.05))) return true
				return false
			},
            reqDesc() { return `Get ${formatMass(uni("ee9"))} mass with one black hole challenge have at most 5% of total completions.` },
            desc: `Reduce the auto-sweeper threshold by 2 completions / tiers.`,
			perm: true,
            cost: E(1e100),
			noIcon: true,
        },
        feat5: {
            unl() { return player.ext.amt.gte(1) },
            req() { return player.mass.gte(uni("ee9")) && player.ext.time <= 3600 },
            reqDesc() { return `Reach ${formatMass(uni("ee9"))} mass in 1 hour of Exotic Run.` },
            desc: `+^0.05 to Mass and Rage gain exponents and their caps.`,
			perm: true,
            cost: E(1e40),
			noIcon: true,
        },
        feat6: {
            unl() { return player.ext.amt.gte(1) },
            req() { return player.mass.lt(uni("ee10")) && tmp.supernova.bulk.sub(player.supernova.times).round().gte(15) },
            reqDesc() { return `Get +15 Supernova gains in under ${formatMass(uni("ee10"))} mass` },
            desc: `Pre-Ultra Supernova scalings start 1 later.`,
			perm: true,
            cost: E(0),
			noIcon: true,
        },

		//EXOTIC
        qol_ext1: {
            branch: ["qol1"],
            unl() { return player.ext.amt.gte(1) },
            req() { return player.supernova.times.gte(4) },
            reqDesc() { return `${format(4,0)} Supernovas` },
            desc: `You don't need to do requirements before buying several Supernova upgrades.`,
			perm: true,
            cost: E(2000),
			noIcon: true,
            effect() {
                let x = E(1)
                return x
            },
            effDesc(x) { return format(x)+"x" },
        },
        qol_ext2: {
            branch: ["qol_ext1"],
			req() { return player.ext.amt.gte(10) },
            reqDesc() { return format(10) + " Exotic Matter" },
            desc: `Reduce the auto-sweeper threshold to 10.`,
			perm: true,
            cost: E(1e150),
			noIcon: true,
            effect() {
                let x = E(1)
                return x
            },
            effDesc(x) { return format(x)+"x" },
        },
        qol_ext3: {
            branch: ["qol_ext1"],
			req() { return player.supernova.radiation.hz.gte(1e50) },
            reqDesc() { return "Get " + format(1e50) + " frequency of radiation." },
            desc: `Radiation Boosters are fully automated for at least 1,000,000 radiation.`,
			perm: true,
            cost: E(1e275),
			noIcon: true,
            effect() {
                let x = E(1)
                return x
            },
            effDesc(x) { return format(x)+"x" },
        },
        qol_ext4: {
            branch: ["qol_ext1"],
			req() {
				let sum = E(0)
				for (var i = 1; i <= CHALS.cols; i++) sum = sum.add(player.chal.comps[i])
				return sum.round().gte(7e3)
			},
            reqDesc: `Get 7,000 challenge completions.`,
            desc: `Keep the 'chal' upgrades except you start with 50 completions.`,
			perm: true,
            cost: E(1e250),
			noIcon: true,
            effect() {
                let x = E(1)
                return x
            },
            effDesc(x) { return format(x)+"x" },
        },
        qol_ext5: {
            branch: ["qol_ext1"],
            desc: `Keep the core Supernova upgrades.`,
			perm: true,
            cost: E(1e200),
			noIcon: true,
            effect() {
                let x = E(1)
                return x
            },
            effDesc(x) { return format(x)+"x" },
        },
        qol_ext6: {
            branch: ["qol_ext1"],
            desc: `[Coming soon!]`,
			perm: true,
            cost: E(1/0),
			noIcon: true,
            effect() {
                let x = E(1)
                return x
            },
            effDesc(x) { return format(x)+"x" },
        },
        ext1: {
			branch: ["eb2"],
            desc: `Axion Upgrades cheapen one row above. [Coming soon!]`,
            cost: E(1/0),
			perm: true,
			noIcon: true,
        },
        ext2: {
			branch: ["ext1"],
            desc: `Axion Upgrades cheapen one row below. [Coming soon!]`,
            cost: E(1/0),
			perm: true,
			noIcon: true,
        },
        ext3: {
			branch: ["ext2"],
            desc: `Axion Upgrades cheapen two rows above. [Coming soon!]`,
            cost: E(1/0),
			perm: true,
			noIcon: true,
        },
        ext4: {
			branch: ["ext1"],
            desc: `Axion Upgrades make two column right less expensive. [Coming soon!]`,
            cost: E(1/0),
			perm: true,
			noIcon: true,
        },
        ext5: {
			branch: ["ext3", "ext4"],
            desc: `Boost 'ext1' - 'ext4' upgrades based on Exotic Matter. [Coming soon!]`,
            cost: E(1/0),
			perm: true,
			noIcon: true,
        },
        /*
        x: {
            unl() { return true },
            req() { return true },
            reqDesc: ``,
            desc: `Placeholder.`,
            cost: E(1/0),
            effect() {
                let x = E(1)
                return x
            },
            effDesc(x) { return format(x)+"x" },
        },
        */
    },
}

function featCheck() {
	if (!(player.auto_ranks.rank && player.auto_ranks.tier && player.auto_ranks.tetr && player.auto_ranks.pent)) return
	if (!(player.autoMassUpg[1] && player.autoMassUpg[2] && player.autoMassUpg[3] && player.autoTickspeed)) return
	if (!(player.auto_mainUpg.rp && player.auto_mainUpg.bh && player.auto_mainUpg.atom)) return
	if (!(player.bh.autoCondenser && player.atom.auto_gr)) return
	if (player.chal.active) return
	if (player.supernova.time < 5) return
	return true
}

function setupTreeHTML() {
    let tree_table = new Element("tree_table")
	let table = ``
	for (let i = 0; i < 19; i++) {
        table += `<div class="table_center"><div class="table_center" style="min-width: 1406px">`
        for (let j = 0; j < 19; j++) {
            let id = TREE_IDS[i][j]
            let option = id == "" ? `style="visibility: hidden"` : ``
            let img = !TREE_UPGS.ids[id] ? `` : TREE_UPGS.ids[id].noIcon ? ` <img src="images/tree/placeholder.png">` : `<img src="images/tree/${id}.png">`
            table += `<button id="treeUpg_${id}" class="btn_tree" onclick="TREE_UPGS.buy('${id}'); tmp.supernova.tree_choosed = '${id}'" ${option}>${img}</button>`
        }
        table += `</div></div>`
	}
	tree_table.setHTML(table)
}

function retrieveCanvasData() {
	let treeCanv = document.getElementById("tree_canvas")
	if (treeCanv===undefined||treeCanv===null) return false;
    tree_canvas = treeCanv
	tree_ctx = tree_canvas.getContext("2d");
	return true;
}

function resizeCanvas() {
    if (!retrieveCanvasData()) return
	tree_canvas.width = 0;
	tree_canvas.height = 0;
	tree_canvas.width = tree_canvas.clientWidth
	tree_canvas.height = tree_canvas.clientHeight
}

function drawTreeHTML() {
    if (tmp.tab == 5) {
        if (tree_canvas.width == 0 || tree_canvas.height == 0) resizeCanvas()
        drawTree()
    }
}

function drawTree() {
	if (!retrieveCanvasData()) return;
	tree_ctx.clearRect(0, 0, tree_canvas.width, tree_canvas.height);
	for (let x in tmp.supernova.tree_had) {
        let id = tmp.supernova.tree_had[x]
        let branch = TREE_UPGS.ids[id].branch||[]
        if (branch.length > 0 && tmp.supernova.tree_unlocked[id]) for (let y in branch) {
			drawTreeBranch(branch[y], id)
		}
	}
}

function treeCanvas() {
    if (!retrieveCanvasData()) return
    if (tree_canvas && tree_ctx) {
        window.addEventListener("resize", resizeCanvas)

        tree_canvas.width = tree_canvas.clientWidth
        tree_canvas.height = tree_canvas.clientHeight
    }
}

function drawTreeBranch(num1, num2) {
    var start = document.getElementById("treeUpg_"+num1).getBoundingClientRect();
    var end = document.getElementById("treeUpg_"+num2).getBoundingClientRect();
    var x1 = start.left + (start.width / 2) + (document.documentElement.scrollLeft || document.body.scrollLeft) - (window.innerWidth-tree_canvas.width)/2;
    var y1 = start.top + (start.height / 2) + (document.documentElement.scrollTop || document.body.scrollTop) - (window.innerHeight-tree_canvas.height-7);
    var x2 = end.left + (end.width / 2) + (document.documentElement.scrollLeft || document.body.scrollLeft) - (window.innerWidth-tree_canvas.width)/2;
    var y2 = end.top + (end.height / 2) + (document.documentElement.scrollTop || document.body.scrollTop) - (window.innerHeight-tree_canvas.height-7);
    tree_ctx.lineWidth=10;
    tree_ctx.beginPath();
    tree_ctx.strokeStyle = player.supernova.tree.includes(num2)?"#00520b":tmp.supernova.tree_afford[num2]?"#fff":"#333";
    tree_ctx.moveTo(x1, y1);
    tree_ctx.lineTo(x2, y2);
    tree_ctx.stroke();
}

function updateTreeHTML() {
    let req = ""
	let perm = ""
    if (tmp.supernova.tree_choosed != "") {
		req = TREE_UPGS.ids[tmp.supernova.tree_choosed].req?`<span class="${TREE_UPGS.ids[tmp.supernova.tree_choosed].req()?"green":"red"}">${TREE_UPGS.ids[tmp.supernova.tree_choosed].reqDesc?" Require: "+(typeof TREE_UPGS.ids[tmp.supernova.tree_choosed].reqDesc == "function"?TREE_UPGS.ids[tmp.supernova.tree_choosed].reqDesc():TREE_UPGS.ids[tmp.supernova.tree_choosed].reqDesc):""}</span>`:""
		perm = TREE_UPGS.ids[tmp.supernova.tree_choosed].perm ? `<span class='yellow'> [Permanent]</span>` : ``
	}
    tmp.el.tree_desc.setHTML(
        tmp.supernova.tree_choosed == "" ? `<div style="font-size: 12px; font-weight: bold;"><span class="gray">(click any tree upgrade to show)</span></div>`
        : `<div style="font-size: 12px; font-weight: bold;"><span class="gray">(click again to buy if affordable)</span>${req}</div>
        <span class="sky">[${tmp.supernova.tree_choosed}] ${TREE_UPGS.ids[tmp.supernova.tree_choosed].desc}</span>${perm}<br>
        <span>Cost: ${format(TREE_UPGS.ids[tmp.supernova.tree_choosed].cost,2)} Neutron star</span><br>
        <span class="green">${TREE_UPGS.ids[tmp.supernova.tree_choosed].effDesc?"Currently: "+TREE_UPGS.ids[tmp.supernova.tree_choosed].effDesc(tmp.supernova.tree_eff[tmp.supernova.tree_choosed]):""}</span>
        `
    )
    for (let x = 0; x < tmp.supernova.tree_had.length; x++) {
        let id = tmp.supernova.tree_had[x]
        let unl = tmp.supernova.tree_unlocked[id]
        tmp.el["treeUpg_"+id].setVisible(unl)
        if (unl) tmp.el["treeUpg_"+id].setClasses({btn_tree: true, locked: !tmp.supernova.tree_afford[id], bought: player.supernova.tree.includes(id), perm: player.supernova.tree.includes(id) && TREE_UPGS.ids[id].perm, choosed: id == tmp.supernova.tree_choosed})
    }
}
