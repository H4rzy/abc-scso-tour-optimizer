using System;
using SCSO_ABC_hybrid;
using System.Text.Json;
using System.Text.Json.Serialization;
class Program
{
    static void Main(string[] args)
    {
        // BASIC-ABC
        //var bee = new BeeColony(population: 10, dimension: 3, iterMax: 50, ub: 5.0, lb: -5.0);
        //bee.RunABC();

        //STANDARD-SCSO
        //var scso = new SandCatSwarm(population: 10, dimension: 3, itermax: 30, ub: 5.0, lb: -5.0);
        //scso.Initial_Population();
        //for (int i = 1; i <= scso.iterMax; i++)
        //{
        //    scso.iterC = i;
        //    var best = scso.BestValues();
        //    foreach (var key in scso.SandCat.Keys)
        //    {
        //        var cur = scso.SandCat[key];
        //        if (Math.Abs(scso.Equation_2()) <= 1)
        //            scso.SandCat[key] = scso.UpdateWithEq5(cur, best);
        //        else
        //            scso.SandCat[key] = scso.UpdateWithEq4(cur, best);
        //    }
        //    Console.WriteLine("Iter " + i + " best objective: " + scso.Objective(best));
        //}

        //HYBRID-SCSCO-ABC (test on Ackley)

        //var bee = new BeeColony(20, 5, 100, 5.12, -5.12);
        //var scso = new SandCatSwarm(20, 5, 100, 5.12, -5.12);

        //var hybrid = new HybridABCSCSO(bee, scso);
        //var result = hybrid.Run();

        //Console.WriteLine("Best hybrid solution: " + string.Join(", ", result.bestX));
        //Console.WriteLine("Best hybrid objective: " + result.bestF);

        //TEST HYBRID WWITH DATA FROM JSON FILE
        var tour = new TourData();

        string exeDir = AppDomain.CurrentDomain.BaseDirectory;
        string parent = exeDir;

        for (int i = 0; i < 4; i++) 
        {
            parent = Directory.GetParent(parent).FullName;
        }

        string dataDir = Path.Combine(parent, "data");
        string filePath = Path.Combine(dataDir, "tourdata.json");


        try
        {
            tour.LoadFromJson(filePath);
            //Console.WriteLine("=== DỮ LIỆU TOUR ===");
            //tour.Print();
        }
        catch (Exception ex)
        {
            Console.WriteLine("Lỗi tải dữ liệu: " + ex.Message);
            return;
        }

        int population;
        int iterMax;
        int dimension = tour.PointCount;
        population = Math.Max(10, dimension);
        iterMax = 3000;
        double ub = 1.0;
        double lb = 0.0;

        var bee = new BeeColony(population, dimension, iterMax, ub, lb);
        var scso = new SandCatSwarm(population, dimension, iterMax, ub, lb);

        bee.SetTourData(tour);
        scso.SetTourData(tour);

        var hybrid = new HybridABCSCSO(bee, scso);

        var (bestX, bestF) = hybrid.Run(tour);

        var bestRouteIndex = tour.DecodeRandomKey(bestX);
        var bestRouteName = bestRouteIndex.Select(i => tour.Destinations[i]).ToList();

        var resultObj = new
        {
            algorithm = "Hybrid ABC-SCSO + 2-Opt",
            population = population,
            iterations = iterMax,
            bestCost = bestF,
            bestRouteIndex = bestRouteIndex,
            bestRouteName = bestRouteName
        };

        string resultPath = Path.Combine(dataDir, "result.json");
        try
        {
            string json = JsonSerializer.Serialize(resultObj, new JsonSerializerOptions
            {
                WriteIndented = true,
                DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
            });
            File.WriteAllText(resultPath, json);
            Console.WriteLine($"\nĐã lưu kết quả ra file JSON: {resultPath}");

            Console.WriteLine(json);
        }
        catch (Exception ex)
        {
            Console.WriteLine("Lỗi ghi JSON: " + ex.Message);
        }
    }
}
