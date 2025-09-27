using System;
using System.Collections.Generic;
using System.Linq;

namespace SCSO_ABC_hybrid
{
    public class HybridABCSCSO
    {
        private readonly BeeColony bee;
        private readonly SandCatSwarm scso;
        private readonly int N, D, T;
        private readonly double Lb, Ub;
        private readonly Random rd = new Random();
        private int scoutLimit;

        public List<double> BestHistory = new List<double>();

        public HybridABCSCSO(BeeColony bee, SandCatSwarm scso)
        {
            this.bee = bee;
            this.scso = scso;
            N = bee.Population;
            D = bee.Dimension;
            T = bee.iterMax;
            Lb = bee.Lb;
            Ub = bee.Ub;
            scoutLimit = Math.Max(5, D);
        }

        public void Initialize()
        {
            bee.Initial_Population();
            scso.Initial_Population();
            SyncPopulations();
            bee.SaveBestFitnessPerIteration(BestHistory);
        }

        private void SyncPopulations()
        {
            for (int i = 0; i < N; i++)
                scso.SandCat[i] = bee.Bee[i].Values.ToList();
        }

        private List<double> GlobalBest()
        {
            return bee.GetBestBeeValues();
        }

        public (List<double> bestX, double bestF) Run()
        {
            Initialize();

            for (int t = 1; t <= T; t++)
            {
                bee.iterC = t;
                scso.iterC = t;

                Phase1_SCSO_Search();
                Phase2_ABC_Employed();
                Phase3_ABC_Onlooker();
                Phase4_ABC_Scout();

                SyncPopulations();
                bee.SaveBestFitnessPerIteration(BestHistory);

                var currentBestX = GlobalBest();
                double currentBestF = bee.Objective(currentBestX);
                Console.WriteLine($"Iter {t}: best f(x) = {currentBestF:F6}");
            }

            var bestX = GlobalBest();
            double bestF = bee.Objective(bestX);
            return (bestX, bestF);
        }

        private void Phase1_SCSO_Search()
        {
            var best = GlobalBest();
            for (int i = 0; i < N; i++)
            {
                var cur = bee.Bee[i].Values;
                List<double> cand;
                if (Math.Abs(scso.Equation_2()) <= 1)
                    cand = scso.UpdateWithEq5(cur, best);
                else
                    cand = scso.UpdateWithEq4(cur, best);
                bee.GreedySelection(i, cur, cand);
            }
        }

        private void Phase2_ABC_Employed()
        {
            int employedCount = N / 2;
            for (int i = 0; i < employedCount; i++)
            {
                var oldX = bee.Bee[i].Values;
                var cand = bee.NewX(i);
                bee.GreedySelection(i, oldX, cand);
            }
        }

        private void Phase3_ABC_Onlooker()
        {
            for (int i = 0; i < N; i++)
            {
                if (rd.NextDouble() < bee.Probability(i))
                {
                    var oldX = bee.Bee[i].Values;
                    var cand = bee.NewX(i);
                    bee.GreedySelection(i, oldX, cand);
                }
            }
        }

        private void Phase4_ABC_Scout()
        {
            for (int i = 0; i < N; i++)
            {
                var (vals, trial) = bee.Bee[i];
                if (trial > scoutLimit)
                {
                    var fresh = new List<double>(D);
                    for (int j = 0; j < D; j++)
                        fresh.Add(Lb + rd.NextDouble() * (Ub - Lb));
                    bee.Bee[i] = (fresh, 0);
                }
            }
        }
    }
}
