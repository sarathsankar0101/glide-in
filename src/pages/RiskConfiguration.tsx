import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface RiskCondition {
  id: string;
  field: string;
  operator: string;
  value: string;
  weight: number;
}

interface RiskCategory {
  id: string;
  name: string;
  conditions: RiskCondition[];
  totalWeight: number;
  status: 'incomplete' | 'complete';
}

const RiskConfiguration = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('financial');
  
  const [categories, setCategories] = useState<RiskCategory[]>([
    {
      id: 'financial',
      name: 'Financial & Credit',
      conditions: [
        { id: '1', field: 'Loan Amount', operator: '>', value: '5000', weight: 40 },
        { id: '2', field: 'Outstanding Balance', operator: '=', value: '1500', weight: 15 }
      ],
      totalWeight: 55,
      status: 'incomplete'
    },
    {
      id: 'identity',
      name: 'Identity & Verification',
      conditions: [],
      totalWeight: 100,
      status: 'complete'
    },
    {
      id: 'property',
      name: 'Property & Stability',
      conditions: [],
      totalWeight: 100,
      status: 'complete'
    },
    {
      id: 'contactability',
      name: 'Contactability & Behaviour',
      conditions: [],
      totalWeight: 100,
      status: 'complete'
    }
  ]);

  const activeCategory = categories.find(cat => cat.id === activeTab);

  const addCondition = () => {
    if (!activeCategory) return;
    
    const newCondition: RiskCondition = {
      id: Date.now().toString(),
      field: '',
      operator: '>',
      value: '',
      weight: 0
    };

    setCategories(prev => prev.map(cat => 
      cat.id === activeTab 
        ? { ...cat, conditions: [...cat.conditions, newCondition] }
        : cat
    ));
  };

  const removeCondition = (conditionId: string) => {
    setCategories(prev => prev.map(cat => 
      cat.id === activeTab 
        ? { 
            ...cat, 
            conditions: cat.conditions.filter(c => c.id !== conditionId),
            totalWeight: cat.conditions
              .filter(c => c.id !== conditionId)
              .reduce((sum, c) => sum + c.weight, 0)
          }
        : cat
    ));
  };

  const updateCondition = (conditionId: string, field: keyof RiskCondition, value: any) => {
    setCategories(prev => prev.map(cat => 
      cat.id === activeTab 
        ? { 
            ...cat, 
            conditions: cat.conditions.map(c => 
              c.id === conditionId ? { ...c, [field]: value } : c
            ),
            totalWeight: cat.conditions
              .map(c => c.id === conditionId ? { ...c, [field]: value } : c)
              .reduce((sum, c) => sum + (Number(c.weight) || 0), 0)
          }
        : cat
    ));
  };

  const saveRules = () => {
    toast({
      title: "Rules Saved",
      description: "Risk assessment configuration has been saved successfully.",
    });
  };

  const previewRules = () => {
    toast({
      title: "Rules Preview",
      description: "Opening rules preview...",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Risk Assessment Configuration</h1>
        <p className="text-muted-foreground">Configure scoring rules and conditions for risk assessment</p>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 border-b">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setActiveTab(category.id)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
              activeTab === category.id
                ? 'bg-primary text-primary-foreground border-primary'
                : 'text-muted-foreground hover:text-foreground border-transparent'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Active Category Content */}
      {activeCategory && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>{activeCategory.name}</CardTitle>
              <p className="text-sm text-muted-foreground">
                Define conditions and weights for this category
              </p>
            </div>
            <Badge variant={activeCategory.totalWeight === 100 ? "default" : "destructive"}>
              Total: {activeCategory.totalWeight}%
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeCategory.conditions.map((condition) => (
              <div key={condition.id} className="flex items-center gap-4 p-4 border rounded-lg">
                <div className="flex-1">
                  <Label>Field</Label>
                  <Input
                    value={condition.field}
                    onChange={(e) => updateCondition(condition.id, 'field', e.target.value)}
                    placeholder="e.g., Loan Amount"
                  />
                </div>
                <div className="w-24">
                  <Label>Operator</Label>
                  <Select
                    value={condition.operator}
                    onValueChange={(value) => updateCondition(condition.id, 'operator', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value=">">{">"}</SelectItem>
                      <SelectItem value="<">{"<"}</SelectItem>
                      <SelectItem value="=">=</SelectItem>
                      <SelectItem value=">=">{"≥"}</SelectItem>
                      <SelectItem value="<=">{"≤"}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-32">
                  <Label>Value</Label>
                  <Input
                    value={condition.value}
                    onChange={(e) => updateCondition(condition.id, 'value', e.target.value)}
                    placeholder="5000"
                  />
                </div>
                <div className="w-20">
                  <Label>Weight %</Label>
                  <Input
                    type="number"
                    value={condition.weight}
                    onChange={(e) => updateCondition(condition.id, 'weight', Number(e.target.value))}
                    placeholder="40"
                  />
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeCondition(condition.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}

            <Button
              variant="outline"
              onClick={addCondition}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Condition
            </Button>

            <div className="text-sm text-muted-foreground">
              {activeCategory.conditions.length} conditions configured
            </div>
          </CardContent>
        </Card>
      )}

      {/* Configuration Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Configuration Summary</CardTitle>
          <p className="text-sm text-muted-foreground">
            Overview of all configured scoring rules
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((category) => (
              <div key={category.id} className="text-center p-4 border rounded-lg">
                <h3 className="font-medium text-sm">{category.name}</h3>
                <div className="text-2xl font-bold mt-2">{category.conditions.length}</div>
                <p className="text-xs text-muted-foreground">Weight: {category.totalWeight}%</p>
                <Badge 
                  variant={category.status === 'complete' ? "default" : "secondary"}
                  className="mt-2"
                >
                  {category.status === 'complete' ? 'Complete' : 'Incomplete'}
                </Badge>
              </div>
            ))}
          </div>

          <div className="flex gap-2 mt-6">
            <Button onClick={previewRules} variant="outline">
              Preview Rules
            </Button>
            <Button onClick={saveRules}>
              Save Configuration
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RiskConfiguration;