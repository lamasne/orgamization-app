export default function InfoTab() {
  return (
    <div className="p-6 max-w-3xl mx-auto">

      <h1 className="text-3xl font-bold mb-6">Gamifying Organization</h1>
      <h2 className="text-2xl font-bold mb-4">Activities and Goals</h2>

      <p className="mb-4">
        After realizing that all my activities are planned based on optimizing my
        pleasure/pain ratio (cf. <span className="italic">The Method</span>), the
        pleasurable experiences one can have are triggered by their nervous system
        interacting with objects. I chose to split these stimuli into 3 categories:
      </p>

      <ul className="list-disc list-inside mb-4">
        <li>Objects</li>
        <li>Human beings</li>
        <li>Myself</li>
      </ul>

      <p className="mb-4">
        In current society, access to objects mostly means earning enough money. Since
        it is essential at short-term (e.g. food and a home) and typically takes about
        half of one's weekly activity, a whole section called{" "}
        <span className="font-semibold">source of income</span> is dedicated to it.
      </p>

      <p className="mb-4">
        The other part of activities relating to objects is the management of resources
        comprising:
      </p>

      <ul className="list-disc list-inside mb-4 ml-4">
        <li>Their use (to experience pleasure), aka leisure</li>
        <li>Their exchange</li>
        <li>Their maintenance</li>
      </ul>

      <p className="mb-6">
        This is implemented in the <span className="font-semibold">Personal</span>{" "}
        section, along with the planning of interactions with the other categories,
        i.e., human beings, body, and mind.
      </p>

      <h2 className="text-xl font-semibold mb-2">
        Activities categories according to goal behind
      </h2>

      <ol className="list-decimal list-inside space-y-2">
        <li>
          Source of income
        </li>
        <li>
          Resource management (e.g. buy, repair, clean, etc.)
          <ul className="list-disc list-inside ml-6">
            <li>Food &amp; Home related objects</li>
            <li>Other</li>
          </ul>
        </li>
        <li>
          Social relationships
          <ul className="list-disc list-inside ml-6">
            <li>Lover</li>
            <li>Family</li>
            <li>Friends</li>
            <li>Public image</li>
          </ul>
        </li>
        <li>
          Me
          <ul className="list-disc list-inside ml-6">
            <li>Mental activity</li>
            <li>Physical activity</li>
          </ul>
        </li>
      </ol>
    </div>
  );
}
