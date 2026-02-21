import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const vehicles = [
  { id: "V-101", name: "Ford Transit", plate: "XYZ-1234", capacity: "1500kg", odometer: "45,200 km", status: "Available" },
  { id: "V-102", name: "Mercedes Sprinter", plate: "ABC-9876", capacity: "2000kg", odometer: "12,400 km", status: "On Trip" },
  { id: "V-103", name: "Renault Master", plate: "LMN-4567", capacity: "1800kg", odometer: "89,100 km", status: "In Shop" },
  { id: "V-104", name: "VW Crafter", plate: "PQR-3321", capacity: "2200kg", odometer: "34,900 km", status: "Available" },
]

export function VehicleRegistryPage() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Vehicle Registry</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage your fleet physical assets, verify capacities, and check availability statuses.
          </p>
        </div>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" /> Add Vehicle
        </Button>
      </div>

      <Card className="border-border/50 shadow-sm bg-card overflow-hidden">
        <CardHeader className="bg-muted/10 border-b border-border/50 pb-4">
          <CardTitle className="text-lg">Fleet Overview</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vehicle ID</TableHead>
                <TableHead>Model</TableHead>
                <TableHead>License Plate</TableHead>
                <TableHead>Max Capacity</TableHead>
                <TableHead>Odometer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vehicles.map((v) => (
                <TableRow key={v.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="font-medium">{v.id}</TableCell>
                  <TableCell>{v.name}</TableCell>
                  <TableCell>{v.plate}</TableCell>
                  <TableCell>{v.capacity}</TableCell>
                  <TableCell>{v.odometer}</TableCell>
                  <TableCell>
                    <Badge
                      className={
                        v.status === "Available" ? "bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/25 border-emerald-500/20" :
                          v.status === "On Trip" ? "bg-blue-500/15 text-blue-600 hover:bg-blue-500/25 border-blue-500/20" :
                            "bg-destructive/15 text-destructive hover:bg-destructive/25 border-destructive/20"
                      }
                      variant="outline"
                    >
                      {v.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="hover:bg-primary/10 hover:text-primary">Edit</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
