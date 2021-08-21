import { STAGE, TREE, WORKDIR, walk } from 'isomorphic-git'

export function statusMatrix({
  fs,
  dir,
  gitdir = dir + '/.git',
  ref = 'HEAD',
  filepaths = ['.'],
  filter = (filepath) => true,
  cache = {},
}) {
  return walk({
    fs,
    cache,
    dir,
    gitdir,
    trees: [TREE({ ref }), WORKDIR(), STAGE()],
    map: async function(filepath, [head, workdir, stage]) {
      // match against base paths
      if (!filepaths.some(base => worthWalking(filepath, base))) {
        return null
      }
      // Late filter against file names
      if (filter) {
        if (!filter(filepath)) return
      }

      // For now, just bail on directories
      const headType = head && (await head.type())
      if (headType === 'tree' || headType === 'special') return
      if (headType === 'commit') return null

      const workdirType = workdir && (await workdir.type())
      if (workdirType === 'tree' || workdirType === 'special') return

      const stageType = stage && (await stage.type())
      if (stageType === 'commit') return null
      if (stageType === 'tree' || stageType === 'special') return

      // Figure out the oids, using the staged oid for the working dir oid if the stats match.
      const headOid = head ? await head.oid() : undefined
      const stageOid = stage ? await stage.oid() : undefined
      let workdirOid
      if (!head && workdir && !stage) {
        // We don't actually NEED the sha. Any sha will do
        // TODO: update this logic to handle N trees instead of just 3.
        workdirOid = '42'
      } else if (workdir) {
        workdirOid = await workdir.oid()
      }
      const entry = [undefined, headOid, workdirOid, stageOid]
      const result = entry.map(value => entry.indexOf(value))
      result.shift() // remove leading undefined entry
      return [filepath, ...result]
    },
  })
}

const worthWalking = (filepath, root) => {
  if (filepath === '.' || root == null || root.length === 0 || root === '.') {
    return true
  }
  if (root.length >= filepath.length) {
    return root.startsWith(filepath)
  } else {
    return filepath.startsWith(root)
  }
}
